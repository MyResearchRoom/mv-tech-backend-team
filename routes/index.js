const express = require("express");
const router = express.Router();

const authRoutes = require("./authRoutes");
const companyRoutes = require("./companyRoutes");


router.use("/api/auth", authRoutes);
router.use("/api/companies", companyRoutes);

module.exports = router;
