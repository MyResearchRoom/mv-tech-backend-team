const router = require("express").Router();
const authenticate = require("../middlewares/authMiddleware");         
const { uploadDrawings } = require("../middlewares/upload");
const { createProspectRules, updateProspectRules, prospectIdRule, } = require("../middlewares/prospectValidation");
const { validate } = require("../middlewares/validations");
const prospectController = require("../controllers/prospectController");

router.post(
    "/add",
    authenticate(),
    uploadDrawings,
    createProspectRules,
    validate,
    prospectController.createProspect
);

router.get(
    "/getAllProspect", 
    authenticate(),
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

router.delete(
    "/documents/:id",
    authenticate(),
    prospectController.deleteDocumentById
);

router.put(
    "/edit/:id", 
    authenticate(),
    uploadDrawings, 
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