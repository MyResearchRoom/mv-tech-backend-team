const { body, param, query } = require("express-validator");
const { Prospect, Company } = require("../models");
const { Op } = require("sequelize");

const PROSPECT_TYPES = ["Individual", "Company", "Builder / Developer", "Contractor", "Consultant", "Other"];
const PROJECT_TYPES = ["Residential", "Commercial", "Industrial", "Hospital", "Educational", "Hotel", "Warehouse", "Mixed Use", "Other"];
const PROJECT_STATUSES = ["Concept / Planning", "Under Construction", "Retrofit / Operational"];

const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;
const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
const PHONE_REGEX = /^\+?[0-9][0-9\s-]{8,14}$/;

const optional = { checkFalsy: true };

exports.createProspectRules = [
  body("companyId")
    .notEmpty().withMessage("Company ID is required").bail()
    .isInt({ min: 1 }).withMessage("Invalid company ID").bail()
    .toInt()
    .custom(async (companyId) => {
      const company = await Company.findByPk(companyId, { attributes: ["id"] });
      if (!company) throw new Error("Company not found");
      return true;
    }),

  body("prospectType")
    .trim().notEmpty().withMessage("Prospect type is required").bail(),
  

  body("companyName")
    .trim().notEmpty().withMessage("Prospect / company name is required").bail()
    .isLength({ max: 150 }).withMessage("Name must be 150 characters or fewer"),

  body("contactPerson")
    .trim().notEmpty().withMessage("Contact person name is required").bail()
    .isLength({ max: 100 }).withMessage("Contact person must be 100 characters or fewer"),

  body("designation").optional(optional).trim().isLength({ max: 100 }),

  body("mobile")
    .trim().notEmpty().withMessage("Mobile number is required").bail()
    .matches(PHONE_REGEX).withMessage("Enter a valid mobile number"),

  body("alternateContact")
    .optional(optional).trim()
    .matches(PHONE_REGEX).withMessage("Enter a valid alternate contact number"),

  body("email")
    .trim().notEmpty().withMessage("Email address is required").bail()
    .isEmail().withMessage("Enter a valid email address").bail()
    .toLowerCase(),

  body("website")
    .optional(optional).trim()
    .isURL({ require_protocol: false }).withMessage("Enter a valid website"),

  body("gstin")
    .optional(optional).trim().toUpperCase()
    .matches(GSTIN_REGEX).withMessage("Enter a valid 15-character GSTIN").bail()
    .custom(async (value, { req }) => {
      const where = { gstin: value };
      if (req.params?.id) where.id = { [Op.ne]: Number(req.params.id) };   // skip itself on edit
      const exists = await Prospect.findOne({ where, attributes: ["id"] });
      if (exists) throw new Error("A prospect with this GSTIN already exists");
      return true;
    }),

  body("pan")
    .optional(optional).trim().toUpperCase()
    .matches(PAN_REGEX).withMessage("Enter a valid 10-character PAN"),


  body("registeredAddress").optional(optional).trim(),
  body("city").optional(optional).trim().isLength({ max: 80 }),
  body("state").optional(optional).trim().isLength({ max: 80 }),
  body("pinCode")
    .optional(optional).trim()
    .matches(/^[0-9]{6}$/).withMessage("PIN code must be 6 digits"),
  body("country").optional(optional).trim().isLength({ max: 60 }),
  body("remarks").optional(optional).trim(),

  // ---------- B. Initial Project Details (all optional) ----------
  body("project.projectName").optional(optional).trim().isLength({ max: 200 }),


  body("project.projectType").optional(optional).trim(),

  body("project.projectLocation").optional(optional).trim().isLength({ max: 200 }),

  body("project.projectStatus").optional(optional).trim(),
  

  body("project.builtUpArea")
    .optional(optional)
    .isFloat({ min: 0 }).withMessage("Built-up area must be a positive number").toFloat(),

  body("project.towers")
    .optional(optional)
    .isInt({ min: 0 }).withMessage("Buildings / towers must be a whole number").toInt(),

  body("project.floors")
    .optional(optional)
    .isInt({ min: 0 }).withMessage("Floors must be a whole number").toInt(),

  body("project.basements")
    .optional(optional)
    .isInt({ min: 0 }).withMessage("Basements must be a whole number").toInt(),

  body("project.siteAddress").optional(optional).trim(),
  body("project.expectedTimeline").optional(optional).trim().isLength({ max: 100 }),
  body("project.fireAuthority").optional(optional).trim().isLength({ max: 150 }),
  body("project.fireRequirements").optional(optional).trim(),
];

exports.prospectIdRule = [
  param("id").isInt({ min: 1 }).withMessage("Invalid prospect id").toInt(),
];

exports.documentOwnerRules = [
  query("ownerId").isInt({ min: 1 }).withMessage("Invalid owner id").toInt(),
  query("ownerType")
    .isIn(["prospect", "client", "project"])
    .withMessage("Owner type must be prospect, client, or project"),
];

exports.companyIdQueryRule = [
  query("companyId")
    .notEmpty().withMessage("Company ID is required").bail()
    .isInt({ min: 1 }).withMessage("Invalid company ID").bail()
    .toInt()
    .custom(async (companyId) => {
      const company = await Company.findByPk(companyId, { attributes: ["id"] });
      if (!company) throw new Error("Company not found");
      return true;
    }),
];

exports.updateProspectRules = [
  ...exports.prospectIdRule,
  ...exports.createProspectRules,
];