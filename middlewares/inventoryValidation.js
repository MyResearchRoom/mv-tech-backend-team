const { body, param, query } = require("express-validator");

const optional = { checkFalsy: true };
const updateableTextFields = [
  ["name", 255, "Item name"],
  ["company", 150, "Company"],
  ["unit", 50, "Unit"],
  ["hsnCode", 20, "HSN code"],
  ["category", 150, "Category"],
  ["itemGroup", 100, "Item group"],
  ["itemType", 100, "Item type"],
  ["barcode", 100, "Barcode"],
  ["rackBox", 100, "Rack/box"],
];

exports.createInventoryItemRules = [
  body("name")
    .trim()
    .notEmpty().withMessage("Item name is required.").bail()
    .isLength({ max: 255 }).withMessage("Item name must be 255 characters or fewer."),
  body("company").optional(optional).trim().isLength({ max: 150 }).withMessage("Company must be 150 characters or fewer."),
  
  body("unit")
    .trim()
    .notEmpty().withMessage("Unit is required.").bail()
    .isLength({ max: 50 }).withMessage("Unit must be 50 characters or fewer."),
  body("hsnCode").optional(optional).trim().isLength({ max: 20 }).withMessage("HSN code must be 20 characters or fewer."),
  body("category").optional(optional).trim().isLength({ max: 150 }).withMessage("Category must be 150 characters or fewer."),
  body("itemGroup").optional(optional).trim().isLength({ max: 100 }).withMessage("Item group must be 100 characters or fewer."),
  body("itemType").optional(optional).trim().isLength({ max: 100 }).withMessage("Item type must be 100 characters or fewer."),
  body("barcode").optional(optional).trim().isLength({ max: 100 }).withMessage("Barcode must be 100 characters or fewer."),
  body("rackBox").optional(optional).trim().isLength({ max: 100 }).withMessage("Rack/box must be 100 characters or fewer."),
  body("price")
    .optional()
    .isFloat({ min: 0, max: 999999999999.99 })
    .withMessage("Price must be a non-negative number with at most 2 decimal places.")
    .bail()
    .custom((value) => /^\d{1,12}(?:\.\d{1,2})?$/.test(String(value)))
    .withMessage("Price must be a non-negative number with at most 2 decimal places.")
    .toFloat(),
  body("reorderLevel")
    .optional()
    .isFloat({ min: 0, max: 99999999.99 })
    .withMessage("Reorder level must be a non-negative number with at most 2 decimal places.")
    .bail()
    .custom((value) => /^\d{1,8}(?:\.\d{1,2})?$/.test(String(value)))
    .withMessage("Reorder level must be a non-negative number with at most 2 decimal places."),

];

exports.inventoryListRules = [
  query("active")
    .optional()
    .isIn(["true", "false"])
    .withMessage("Active filter must be true or false."),
  query("company")
    .optional(optional)
    .trim()
    .isLength({ max: 150 })
    .withMessage("Company must be 150 characters or fewer."),
  query("stockStatus")
    .optional()
    .isIn(["lowStock", "inStock", "outOfStock"])
    .withMessage("Stock status must be lowStock, inStock, or outOfStock."),
];

exports.inventoryStockQueryRules = [
  query("searchTerm")
    .optional(optional)
    .trim()
    .isLength({ max: 200 })
    .withMessage("Search term must be 200 characters or fewer."),
  query("entryDate")
    .optional()
    .isISO8601({ strict: true, strictSeparator: true })
    .withMessage("Entry date must be a valid date in YYYY-MM-DD format."),
];

exports.inventoryItemIdRule = [
  param("id")
    .isInt({ min: 1 })
    .withMessage("Inventory item ID must be a positive integer.")
    .toInt(),
];

exports.changeInventoryItemStatusRules = [
  ...exports.inventoryItemIdRule,
];

exports.addInventoryStockRules = [
  body("itemId")
    .isInt({ min: 1 })
    .withMessage("Inventory item ID must be a positive integer.")
    .toInt(),
  body("entryDate")
    .isISO8601({ strict: true, strictSeparator: true })
    .withMessage("Entry date must be a valid date in YYYY-MM-DD format."),
  body("quantity")
    .isFloat({ min: 0.01, max: 99999999.99 })
    .withMessage("Quantity must be greater than zero and at most 8 digits with 2 decimal places.")
    .bail()
    .custom((value) => /^\d{1,8}(?:\.\d{1,2})?$/.test(String(value)))
    .withMessage("Quantity must be greater than zero and at most 8 digits with 2 decimal places.")
    .toFloat(),
  body("rate")
    .optional()
    .isFloat({ min: 0, max: 999999999999.99 })
    .withMessage("Rate must be a non-negative number with at most 2 decimal places.")
    .bail()
    .custom((value) => /^\d{1,12}(?:\.\d{1,2})?$/.test(String(value)))
    .withMessage("Rate must be a non-negative number with at most 2 decimal places.")
    .toFloat(),
  body("supplierName")
    .optional(optional)
    .trim()
    .isLength({ max: 200 })
    .withMessage("Supplier name must be 200 characters or fewer."),
  body("remarks").optional(optional).trim(),
];

exports.updateInventoryItemRules = [
  ...exports.inventoryItemIdRule,
  body().custom((value) => {
    if (!value || !updateableTextFields.some(([field]) => Object.prototype.hasOwnProperty.call(value, field)) &&
      !["reorderLevel", "price"].some((field) => Object.prototype.hasOwnProperty.call(value, field))) {
      throw new Error("Provide at least one inventory item field to update.");
    }
    return true;
  }),

  body("itemCode")
    .not()
    .exists()
    .withMessage("Item code is generated and cannot be changed."),

  ...updateableTextFields.map(([field, maxLength, label]) => {
    const rule = body(field)
      .optional(field === "name" || field === "unit" ? undefined : optional)
      .trim();
    if (field === "name" || field === "unit") {
      rule.notEmpty().withMessage(`${label} cannot be empty.`).bail();
    }
    return rule
      .isLength({ max: maxLength })
      .withMessage(`${label} must be ${maxLength} characters or fewer.`);
  }),
  body("reorderLevel")
    .optional()
    .isFloat({ min: 0, max: 99999999.99 })
    .withMessage("Reorder level must be a non-negative number with at most 2 decimal places.")
    .bail()
    .custom((value) => /^\d{1,8}(?:\.\d{1,2})?$/.test(String(value)))
    .withMessage("Reorder level must be a non-negative number with at most 2 decimal places."),
  body("price")
    .optional()
    .isFloat({ min: 0, max: 999999999999.99 })
    .withMessage("Price must be a non-negative number with at most 2 decimal places.")
    .bail()
    .custom((value) => /^\d{1,12}(?:\.\d{1,2})?$/.test(String(value)))
    .withMessage("Price must be a non-negative number with at most 2 decimal places.")
    .toFloat(),

];
