const jwt = require("jsonwebtoken");
const { User } = require("../models");
const { access_jwt_secret } = require("../config/config");

const authenticate = (requiredRoles = []) => {
  return async (req, res, next) => {
    try {
      const token =
        req.cookies?.accessToken ||
        req.header("Authorization")?.replace(/^Bearer\s+/i, "");

      if (!token) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized. Access token is missing.",
        });
      }

      const decoded = jwt.verify(token, access_jwt_secret);

      const user = await User.findByPk(decoded.id);

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized. User not found.",
        });
      }

      if (!user.active) {
        return res.status(403).json({
          success: false,
          message:
            "Access is restricted. Please contact your administrator.",
        });
      }

      if (
        requiredRoles.length > 0 &&
        !requiredRoles.includes(user.role)
      ) {
        return res.status(403).json({
          success: false,
          message: "Forbidden. You do not have access to this resource.",
        });
      }

      req.user = user;

      next();
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return res.status(401).json({
          success: false,
          message: "Unauthorized. Access token has expired.",
        });
      }

      if (error.name === "JsonWebTokenError") {
        return res.status(401).json({
          success: false,
          message: "Unauthorized. Invalid access token.",
        });
      }

      console.error("Authentication Error:", error);

      return res.status(500).json({
        success: false,
        message: "Internal Server Error. Authentication failed.",
      });
    }
  };
};

module.exports = authenticate;

