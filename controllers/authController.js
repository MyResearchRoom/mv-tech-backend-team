const { User, RefreshToken, sequelize } = require("../models");
const { Op } = require("sequelize");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { ADMIN } = require("../utils/constants");
const {
  generateAccessToken,
  generateRefreshToken,
} = require("../utils/generateToken");
const {
  refresh_token_expires_days,
  refresh_jwt_secret,
} = require("../config/config");

const { validateQueryParams } = require("../utils/validateQueryParams");
const { parsePositiveInteger } = require("../utils/getPositiveInteger");

const ALLOWED_ROLES = [
    "ADMIN",
    "DESIGN HEAD",
    "INVENTORY MANAGER",
    "PROJECT MANAGER",
    "ACCOUNT MANAGER",
    "CLIENT MANAGER",
];

const MANAGED_USER_ROLES = ALLOWED_ROLES.filter((role) => role !== ADMIN);

const findManagedUser = (id, options = {}) =>
  User.findOne({
    where: {
      id,
      role: {
        [Op.ne]: ADMIN,
      },
    },
    ...options,
});

const formatManagedUser = (user) => {
  const data = user.toJSON();
  delete data.password;
  data.profile = data.profile
    ? `data:${data.profileContentType || "image/png"};base64,${data.profile.toString("base64")}`
    : null;
  return data;
};

exports.adminRegistration = async (req, res) => {
  try {
    const {
      name,
      email,
      mobileNumber,
      gender,
      password,
      role,
    } = req.body;

    if (!name || !email || !mobileNumber  || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Admin with this email already exists",
      });
    }

    const existingUserWithMobile = await User.findOne({ where: { mobileNumber } });
    if (existingUserWithMobile) {
      return res.status(400).json({
        success: false,
        message: "User with this mobile number already exists",
      });
    }


    let profileImage = null;
    let profileContentType = null;

    if (req.file) {
      profileImage = req.file?.buffer || null;
      profileContentType = req.file?.mimetype || null;
    }

    const hashedPassword = await bcrypt.hash(password, 10);


    await User.create({
      role,
      name,
      email,
      mobileNumber,
      gender: gender || null,
      password :hashedPassword,
      profile: profileImage,
      imageType: profileContentType,

    });

    res.status(201).json({
      success: true,
      message: "Admin Registered successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to Register User",
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password ,role} = req.body;
    // console.log("email",email,password,role);
    

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    const user = await User.findOne({
      where: {
        email: email.trim().toLowerCase(),
        role: role,
      },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or role.",
      });
    }

    if (!user.active) {
      return res.status(403).json({
        success: false,
        message: "Your account is inactive. Please contact administrator.",
      });
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Incorrect password. Please try again.",
      });
    }

    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    const expiresAt = new Date(
      Date.now() +
        refresh_token_expires_days * 24 * 60 * 60 * 1000
    );

    await RefreshToken.create({
      userId: user.id,
      token: refreshToken,
      expiresAt,
      isRevoked: false,
    });

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "Strict",
      maxAge: 15 * 60 * 1000,
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "Strict",
      maxAge: refresh_token_expires_days * 24 * 60 * 60 * 1000,
    });


    return res.status(200).json({
      success: true,
      message: "Login successful.",
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        mobileNumber: user.mobileNumber,
        gender: user.gender,
        role: user.role,

        profile: user.profile
          ? `data:${user.profileContentType};base64,${user.profile.toString("base64")}`
          : null,
      },
    });

  } catch (error) {
    console.error("Login Error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong during login.",
    });
  }
};

exports.refreshAccessToken = async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Refresh token not found. Please login again.",
      });
    }

    let decoded;

    try {
      decoded = jwt.verify(refreshToken, refresh_jwt_secret);
    } catch (error) {
      return res.status(401).json({
        success: false,
        message:
          error.name === "TokenExpiredError"
            ? "Refresh token expired. Please login again."
            : "Invalid refresh token. Please login again.",
      });
    }

    const storedToken = await RefreshToken.findOne({
      where: {
        token: refreshToken,
        userId: decoded.id,
        isRevoked: false,
      },
    });

    // console.log("storedToken",storedToken);
    

    if (!storedToken) {
      return res.status(401).json({
        success: false,
        message: "Refresh token is invalid or revoked. Please login again.",
      });
    }

    if (new Date(storedToken.expiresAt) <= new Date()) {
      await storedToken.update({
        isRevoked: true,
      });

      return res.status(401).json({
        success: false,
        message: "Refresh token expired. Please login again.",
      });
    }

    const user = await User.findByPk(decoded.id);

    if (!user || !user.active) {
      return res.status(403).json({
        success: false,
        message: "User account is inactive or does not exist.",
      });
    }

    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    const newAccessToken = generateAccessToken(payload);

    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 15 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: "Access token refreshed successfully.",
    });

  } catch (error) {
    console.error("Refresh Token Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to refresh access token.",
    });
  }
};

exports.employeeRegistration = async (req, res) => {
  try {
    const {
      name,
      email,
      mobileNumber,
      gender,
      role,
      password,
    } = req.body;

    if (!name || !email || !mobileNumber || !role || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    if (!ALLOWED_ROLES.includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role selected.",
      });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    const existingUserWithMobile = await User.findOne({ where: { mobileNumber } });
    if (existingUserWithMobile) {
      return res.status(400).json({
        success: false,
        message: "User with this mobile number already exists",
      });
    }

    let profileImage = null;
    let profileContentType = null;

    if (req.file) {
      profileImage = req.file?.buffer || null;
      profileContentType = req.file?.mimetype || null;
    }

    const hashedPassword = await bcrypt.hash(password, 10);


    await User.create({
      role,
      name,
      email,
      mobileNumber,
      gender: gender || null,
      password :hashedPassword,
      profile: profileImage,
      imageType: profileContentType,

    });

    res.status(201).json({
      success: true,
      message: "User Registered successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to Register User",
    });
  }
};

exports.logOut = async (req, res) => {
  try {
    const userId = req.user.id;

    await RefreshToken.update(
      { isRevoked: true },
      {
        where: {
          userId,
          isRevoked: false,
        },
      }
    );

    const cookieOptions = {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      path: "/",
    };

    res.clearCookie("accessToken", cookieOptions);
    res.clearCookie("refreshToken", cookieOptions);

    return res.status(200).json({
      success: true,
      message: "Logged out successfully.",
    });
  } catch (error) {
    console.error("Logout Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to logout.",
    });
  }
};

exports.getUser = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findByPk(userId, {
      attributes: {
        exclude: ["password"],
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const userData = user.toJSON();

    const profileImage = userData.profile
      ? `data:${
          userData.profileContentType || "image/png"
        };base64,${userData.profile.toString("base64")}`
      : null;

    userData.profile = profileImage;

    return res.status(200).json({
      success: true,
      message: "User details fetched successfully.",
      data: userData,
    });

  } catch (error) {
    console.error("Get User Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get user details.",
    });
  }
};

exports.getAllUsers = async (req, res) => {
    try {
        const {
            page,
            limit,
            offset,
            searchTerm,
            isAll
        } = validateQueryParams(req.query);

        const { role, active } = req.query;

        const whereClause = {
            role: {
                [Op.ne]: ADMIN
            }
        };

        if (searchTerm) {
            whereClause[Op.or] = [
                { name: { [Op.like]: `%${searchTerm}%` } },
                { email: { [Op.like]: `%${searchTerm}%` } },
                { mobileNumber: { [Op.like]: `%${searchTerm}%` } }
            ];
        }

        if (role && role !== "all") {
            if (role === ADMIN) {
                return res.status(200).json({
                    success: true,
                    message: "Users fetched successfully.",
                    data: [],
                    pagination: {
                        totalRecords: 0,
                        totalPages: 0,
                        currentPage: 1,
                        itemsPerPage: 0,
                        isAll
                    }
                });
            }

            whereClause.role = role;
        }

        if (active === "true" || active === "false") {
            whereClause.active = active === "true";
        }

        const allowedSortFields = [
            "id",
            "name",
            "email",
            "mobileNumber",
            "role",
            "createdAt",
            "updatedAt"
        ];


        const queryOptions = {
            where: whereClause,
            attributes: {
                exclude: ["password"]
            },
            order: [["createdAt", "DESC"]]
        };

        if (!isAll) {
            queryOptions.limit = limit;
            queryOptions.offset = offset;
        }

        const { rows, count } = await User.findAndCountAll(queryOptions);

        const userData = rows.map((user) => {
            const data = user.toJSON();

            data.profile = data.profile
                ? `data:${data.profileContentType || "image/png"};base64,${data.profile.toString("base64")}`
                : null;

            return data;
        });

        return res.status(200).json({
            success: true,
            message: "Users fetched successfully.",
            data: userData,
            pagination: {
                totalRecords: count,
                totalPages: isAll ? 1 : Math.ceil(count / limit),
                currentPage: isAll ? 1 : page,
                itemsPerPage: isAll ? count : limit,
                isAll
            }
        });

    } catch (error) {
        console.error("Get All Users Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to get users."
        });
    }
};

exports.getUserById = async (req, res) => {
  const userId = parsePositiveInteger(req.params.id);

  if (userId === null) {
    return res.status(400).json({
      success: false,
      message: "User ID must be a positive integer.",
    });
  }

  try {
    const user = await User.findByPk(userId, {
      attributes: {
        exclude: ["password"],
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const data = user.toJSON();

    data.profile = data.profile
      ? `data:${data.profileContentType || "image/png"};base64,${data.profile.toString("base64")}`
      : null;

    return res.status(200).json({
      success: true,
      message: "User details fetched successfully.",
      data,
    });

  } catch (error) {
    console.error("Get User By ID Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch user details.",
    });
  }
};

exports.editUser = async (req, res) => {
  const userId = parsePositiveInteger(req.params.id);
  if (userId === null) {
    return res.status(400).json({
      success: false,
      message: "User ID must be a positive integer.",
    });
  }

  const body =
    req.body && typeof req.body === "object" && !Array.isArray(req.body)
      ? req.body
      : null;
  const editableFields = ["name", "email", "mobileNumber", "gender", "role"];
  const errors = [];

  if (!body) {
    errors.push("Request body must be an object.");
  } else {
    Object.keys(body).forEach((field) => {
      if (!editableFields.includes(field)) {
        errors.push(`${field} cannot be updated through this endpoint.`);
      }
    });

    if (Object.keys(body).length === 0 && !req.file) {
      errors.push("Provide at least one user field or a profile image.");
    }

    if (Object.prototype.hasOwnProperty.call(body, "name")) {
      if (
        typeof body.name !== "string" ||
        !body.name.trim() ||
        body.name.length > 255
      ) {
        errors.push("Name must be a non-empty string of at most 255 characters.");
      }
    }

    if (Object.prototype.hasOwnProperty.call(body, "email")) {
      if (
        typeof body.email !== "string" ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email.trim())
      ) {
        errors.push("A valid email address is required.");
      }
    }

    if (Object.prototype.hasOwnProperty.call(body, "mobileNumber")) {
      if (
        typeof body.mobileNumber !== "string" ||
        !/^\d{10}$/.test(body.mobileNumber.trim())
      ) {
        errors.push("Mobile number must contain exactly 10 digits.");
      }
    }

    if (
      Object.prototype.hasOwnProperty.call(body, "gender") &&
      body.gender !== null &&
      !["male", "female"].includes(body.gender)
    ) {
      errors.push("Gender must be 'male', 'female', or null.");
    }

    if (
      Object.prototype.hasOwnProperty.call(body, "role") &&
      !MANAGED_USER_ROLES.includes(body.role)
    ) {
      errors.push("Role must be a non-admin employee role.");
    }
  }

  if (
    req.file &&
    (!Buffer.isBuffer(req.file.buffer) ||
      typeof req.file.mimetype !== "string")
  ) {
    errors.push("The uploaded profile image is invalid.");
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: "User update details are invalid.",
      errors,
    });
  }

  try {
    const user = await findManagedUser(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Employee not found.",
      });
    }

    const updates = {};
    editableFields.forEach((field) => {
      if (Object.prototype.hasOwnProperty.call(body, field)) {
        const value = body[field];
        updates[field] =
          typeof value === "string" && field !== "gender"
            ? value.trim()
            : value;
      }
    });

    if (Object.prototype.hasOwnProperty.call(updates, "email")) {
      updates.email = updates.email.toLowerCase();
    }

    if (req.file) {
      updates.profile = req.file.buffer;
      updates.profileContentType = req.file.mimetype;
    }

    await user.update(updates);

    return res.status(200).json({
      success: true,
      message: "User updated successfully.",
      data: formatManagedUser(user),
    });
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({
        success: false,
        message: "Email or mobile number is already in use.",
      });
    }

    if (error.name === "SequelizeValidationError") {
      return res.status(400).json({
        success: false,
        message: "User update details are invalid.",
        errors: error.errors.map(
          (validationError) => validationError.message
        ),
      });
    }

    console.error("Edit User Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update user.",
    });
  }
};

exports.changeUserActiveStatus = async (req, res) => {
  const userId = parsePositiveInteger(req.params.id);

  if (userId === null) {
    return res.status(400).json({
      success: false,
      message: "User ID must be a positive integer.",
    });
  }

  try {
    const user = await sequelize.transaction(async (transaction) => {
      const managedUser = await findManagedUser(userId, {
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      if (!managedUser) {
        return null;
      }

      managedUser.active = !managedUser.active;

      await managedUser.save({ transaction });

      if (!managedUser.active) {
        await RefreshToken.update(
          { isRevoked: true },
          {
            where: {
              userId,
              isRevoked: false,
            },
            transaction,
          }
        );
      }

      return managedUser;
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Employee not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User active status updated successfully.",
      data: {
        id: user.id,
        active: user.active,
      },
    });

  } catch (error) {
    console.error("Change User Active Status Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to change user active status.",
    });
  }
};

exports.deleteUser = async (req, res) => {
  const userId = parsePositiveInteger(req.params.id);
  if (userId === null) {
    return res.status(400).json({
      success: false,
      message: "User ID must be a positive integer.",
    });
  }

  try {
    const deletedUserId = await sequelize.transaction(async (transaction) => {
      const user = await findManagedUser(userId, {
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      if (!user) {
        return null;
      }

      await RefreshToken.destroy({
        where: { userId },
        transaction,
      });
      await user.destroy({ transaction });
      return user.id;
    });

    if (deletedUserId === null) {
      return res.status(404).json({
        success: false,
        message: "Employee not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User deleted successfully.",
      data: { id: deletedUserId },
    });
  } catch (error) {
    console.error("Delete User Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete user.",
    });
  }
};

exports.changeUserPassword = async (req, res) => {
  const userId = parsePositiveInteger(req.params.id);
  if (userId === null) {
    return res.status(400).json({
      success: false,
      message: "User ID must be a positive integer.",
    });
  }

  const password = req.body && req.body.password;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const updatedUserId = await sequelize.transaction(async (transaction) => {
      const user = await findManagedUser(userId, {
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      if (!user) {
        return null;
      }

      user.password = hashedPassword;
      await user.save({ transaction });

      return user.id;
    });

    if (updatedUserId === null) {
      return res.status(404).json({
        success: false,
        message: "Employee not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User password changed successfully.",
    });
  } catch (error) {
    console.error("Change User Password Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to change user password.",
    });
  }
};

