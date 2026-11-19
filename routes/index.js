const express = require("express");
const router = express.Router();

const authRoutes = require("./authRoutes");
const companyRoutes = require("./companyRoutes");
const gstRoutes = require("./gstRoutes");
const prospectRoutes = require("./prospectRoute");



router.use("/api/auth", authRoutes);
router.use("/api/companies", companyRoutes);
router.use("/api/gst", gstRoutes);
router.use("/api/prospect", prospectRoutes);


module.exports = router;
