
const express = require("express");
const router = express.Router();
const authenticate = require("../middlewares/authMiddleware");
const authController = require("../controllers/authController");
const { upload } = require("../middlewares/upload");
const { userValidationRules, validate } = require("../middlewares/validations");

const { ADMIN, DESIGN_HEAD, PROJECT_MANAGER, INVENTORY_MANAGER, ACCOUNT_MANAGER, CLIENT_MANAGER } = require("../utils/constants");

router.post(
  "/adminRegistration",
  upload.single("profile"),
  userValidationRules,
  validate,
  authController.adminRegistration
);

router.post(
  "/login", 
  authController.login
);

router.post(
  "/refresh-token", 
  authController.refreshAccessToken
);

router.post(
  "/emp-register",
  upload.single("profile"),
  authenticate([ADMIN]),
  userValidationRules,
  validate,
  authController.employeeRegistration
);

router.post(
  "/logout",
  authenticate(),
  authController.logOut
);

router.get(
  "/getUser",
  authenticate([ADMIN, DESIGN_HEAD, INVENTORY_MANAGER,PROJECT_MANAGER,ACCOUNT_MANAGER, CLIENT_MANAGER]),
  authController.getUser
);

router.get(
  "/getAllEmployee",
  authenticate([ADMIN]),
  authController.getAllUsers
);

router.patch(
  "/editUser/:id",
  authenticate([ADMIN]),
  upload.single("profile"),
  authController.editUser
);

router.patch(
  "/changeActiveStatus/:id",
  authenticate([ADMIN]),
  authController.changeUserActiveStatus
);

router.delete(
  "/deleteUser/:id",
  authenticate([ADMIN]),
  authController.deleteUser
);

router.patch(
  "/changePassword/:id",
  authenticate(),
  authController.changeUserPassword
);

router.get(
  "/getUserById/:id", 
  authenticate([ADMIN]),
  authController.getUserById
);


module.exports = router;
