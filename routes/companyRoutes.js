const express = require("express");
const router = express.Router();
const authenticate = require("../middlewares/authMiddleware");
const { upload } = require("../middlewares/upload");
const companyController = require("../controllers/companyController");
const { ADMIN } = require("../utils/constants");
const {
  validateCompany,
  validateCompanyUpdate,
} = require("../middlewares/companyValidation");

router.post(
  "/",
  authenticate([ADMIN]),
  upload.fields([{ name: "logo", maxCount: 1 }, { name: "documents" }]),
  validateCompany,
  companyController.addCompany
);

router.get(
  "/getAllCompanies",
  authenticate([ADMIN]),
  companyController.getAllCompanies
);

router.get(
  "/getCompanyById/:id",
  authenticate([ADMIN]),
  companyController.getCompanyById
);

router.patch(
  "/updateCompany/:id",
  authenticate([ADMIN]),
  upload.fields([{ name: "logo", maxCount: 1 }, { name: "documents" }]),
  validateCompanyUpdate,
  companyController.updateCompany
);

router.patch(
  "/toggleCompanyStatus/:id",
  authenticate([ADMIN]),
  companyController.toggleCompanyStatus
);

router.delete(
  "/deleteCompany/:id",
  authenticate([ADMIN]),
  companyController.deleteCompany
);


module.exports = router;
