const { check, validationResult } = require("express-validator");

const userValidationRules = [
  check("name").notEmpty().withMessage("Name is required.").trim().escape(),

  check("email")
    .notEmpty()
    .withMessage("Email is required.")
    .isEmail()
    .withMessage("Invalid email format.")
    .normalizeEmail(),

  check("mobileNumber")
    .notEmpty()
    .withMessage("Mobile number is required.")
    .isNumeric()
    .withMessage("Mobile number must contain only numbers.")
    .isLength({ min: 10, max: 10 })
    .withMessage("Mobile number must be 10 digits."),

  check("password")
    .notEmpty()
    .withMessage("Password is required.")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long.")
    .matches(/[a-z]/)
    .withMessage("Must include a lowercase letter.")
    .matches(/[A-Z]/)
    .withMessage("Must include an uppercase letter.")
    .matches(/\d/)
    .withMessage("Must include a digit.")
    .matches(/[!@#$%^&*(),.?":{}|<>]/)
    .withMessage("Must include a special character."),

  check("role").notEmpty().withMessage("Role is required.").trim(),

  check("gender")
    .optional({ checkFalsy: true })
    .isIn(["male", "female"])
    .withMessage("Gender must be 'male', 'female'"),


];

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array(),
    });
  }
  next();
};

module.exports = {
  userValidationRules,
  validate,
};
