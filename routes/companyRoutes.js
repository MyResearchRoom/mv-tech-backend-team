const express = require("express");
const router = express.Router();
const authenticate = require("../middlewares/authMiddleware");
const { upload } = require("../middlewares/upload");
const companyController = require("../controllers/companyController");
const { ADMIN, DESIGN_HEAD, INVENTORY_MANAGER, PROJECT_MANAGER, ACCOUNT_MANAGER, CLIENT_MANAGER } = require("../utils/constants");
const {
  validateCompany,
  validateCompanyUpdate,
} = require("../middlewares/companyValidation");

router.post(
  "/",
  authenticate([ADMIN,DESIGN_HEAD,INVENTORY_MANAGER,PROJECT_MANAGER,ACCOUNT_MANAGER,CLIENT_MANAGER]),
  upload.fields([{ name: "logo", maxCount: 1 }, { name: "documents" }]),
  validateCompany,
  companyController.addCompany
);

router.get(
  "/getAllCompanies",
 authenticate([ADMIN,DESIGN_HEAD,INVENTORY_MANAGER,PROJECT_MANAGER,ACCOUNT_MANAGER,CLIENT_MANAGER]),
  companyController.getAllCompanies
);

router.get(
  "/getCompanyById/:id",
 authenticate([ADMIN,DESIGN_HEAD,INVENTORY_MANAGER,PROJECT_MANAGER,ACCOUNT_MANAGER,CLIENT_MANAGER]),
  companyController.getCompanyById
);

router.patch(
  "/updateCompany/:id",
 authenticate([ADMIN,DESIGN_HEAD,INVENTORY_MANAGER,PROJECT_MANAGER,ACCOUNT_MANAGER,CLIENT_MANAGER]),
  upload.fields([{ name: "logo", maxCount: 1 }, { name: "documents" }]),
  validateCompanyUpdate,
  companyController.updateCompany
);

router.patch(
  "/toggleCompanyStatus/:id",
 authenticate([ADMIN,DESIGN_HEAD,INVENTORY_MANAGER,PROJECT_MANAGER,ACCOUNT_MANAGER,CLIENT_MANAGER]),
  companyController.toggleCompanyStatus
);

router.delete(
  "/deleteCompany/:id",
 authenticate([ADMIN,DESIGN_HEAD,INVENTORY_MANAGER,PROJECT_MANAGER,ACCOUNT_MANAGER,CLIENT_MANAGER]),
  companyController.deleteCompany
);


module.exports = router;
