const router = require("express").Router();
const authenticate = require("../middlewares/authMiddleware");         
const { uploadDrawings } = require("../middlewares/upload");
const parseProjectPayload = require("../middlewares/parseProjectPayload");
const {
    createProspectRules,
    updateProspectRules,
    prospectIdRule,
    documentOwnerRules,
    companyIdQueryRule,
} = require("../middlewares/prospectValidation");
const { validate } = require("../middlewares/validations");
const prospectController = require("../controllers/prospectController");

router.post(
    "/add",
    authenticate(),
    uploadDrawings,
    parseProjectPayload,
    createProspectRules,
    validate,
    prospectController.createProspect
);

router.get(
    "/getAllProspect", 
    authenticate(),
    companyIdQueryRule,
    validate,
    prospectController.getAllProspects
);

router.get(
    "/getProspectById/:id", 
    authenticate(),
    prospectIdRule, 
    validate, 
    prospectController.getProspectById
);

router.get(
    "/documents/:id", 
    authenticate(),
    prospectController.getDocumentById
);

router.get(
    "/documents",
    authenticate(),
    documentOwnerRules,
    validate,
    prospectController.getDocumentsByOwner
);

router.post(
    "/:id/drawings",
    authenticate(),
    prospectIdRule,
    validate,
    uploadDrawings,
    prospectController.uploadProspectDrawings
);

router.delete(
    "/documents/:id",
    authenticate(),
    prospectController.deleteDocumentById
);

router.put(
    "/edit/:id", 
    authenticate(),
    uploadDrawings, 
    parseProjectPayload,
    updateProspectRules, 
    validate, 
    prospectController.updateProspect
);

router.delete(
    "/deleteProspect/:id", 
    authenticate(),
    prospectIdRule, 
    validate, 
    prospectController.deleteProspect
);

module.exports = router;