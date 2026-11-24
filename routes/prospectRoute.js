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
const { ADMIN,DESIGN_HEAD,INVENTORY_MANAGER,PROJECT_MANAGER,ACCOUNT_MANAGER,CLIENT_MANAGER } = require("../utils/constants");

router.post(
    "/add",
    authenticate([ADMIN,DESIGN_HEAD,INVENTORY_MANAGER,PROJECT_MANAGER,ACCOUNT_MANAGER,CLIENT_MANAGER]),
    uploadDrawings,
    parseProjectPayload,
    createProspectRules,
    validate,
    prospectController.createProspect
);

router.get(
    "/getAllProspect", 
    authenticate([ADMIN,DESIGN_HEAD,INVENTORY_MANAGER,PROJECT_MANAGER,ACCOUNT_MANAGER,CLIENT_MANAGER]),
    companyIdQueryRule,
    validate,
    prospectController.getAllProspects
);

router.get(
    "/getProspectById/:id", 
    authenticate([ADMIN,DESIGN_HEAD,INVENTORY_MANAGER,PROJECT_MANAGER,ACCOUNT_MANAGER,CLIENT_MANAGER]),
    prospectIdRule, 
    validate, 
    prospectController.getProspectById
);

router.get(
    "/documents/:id", 
    authenticate([ADMIN,DESIGN_HEAD,INVENTORY_MANAGER,PROJECT_MANAGER,ACCOUNT_MANAGER,CLIENT_MANAGER]),
    prospectController.getDocumentById
);

router.get(
    "/documents",
    authenticate([ADMIN,DESIGN_HEAD,INVENTORY_MANAGER,PROJECT_MANAGER,ACCOUNT_MANAGER,CLIENT_MANAGER]),
    documentOwnerRules,
    validate,
    prospectController.getDocumentsByOwner
);

router.post(
    "/:id/drawings",
    authenticate([ADMIN,DESIGN_HEAD,INVENTORY_MANAGER,PROJECT_MANAGER,ACCOUNT_MANAGER,CLIENT_MANAGER]),
    prospectIdRule,
    validate,
    uploadDrawings,
    prospectController.uploadProspectDrawings
);

router.delete(
    "/documents/:id",
    authenticate([ADMIN,DESIGN_HEAD,INVENTORY_MANAGER,PROJECT_MANAGER,ACCOUNT_MANAGER,CLIENT_MANAGER]),
    prospectController.deleteDocumentById
);

router.put(
    "/edit/:id", 
    authenticate([ADMIN,DESIGN_HEAD,INVENTORY_MANAGER,PROJECT_MANAGER,ACCOUNT_MANAGER,CLIENT_MANAGER]),
    uploadDrawings, 
    parseProjectPayload,
    updateProspectRules, 
    validate, 
    prospectController.updateProspect
);

router.delete(
    "/deleteProspect/:id", 
    authenticate([ADMIN,DESIGN_HEAD,INVENTORY_MANAGER,PROJECT_MANAGER,ACCOUNT_MANAGER,CLIENT_MANAGER]),
    prospectIdRule, 
    validate, 
    prospectController.deleteProspect
);

module.exports = router;