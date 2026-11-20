const router = require("express").Router();
const authenticate = require("../middlewares/authMiddleware");
const { documentOwnerRules } = require("../middlewares/prospectValidation");
const { validate } = require("../middlewares/validations");
const prospectController = require("../controllers/prospectController");

router.get(
  "/",
  authenticate(),
  documentOwnerRules,
  validate,
  prospectController.getDocumentsByOwner
);

module.exports = router;
