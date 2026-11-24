const express = require("express");
const router = express.Router();

const authRoutes = require("./authRoutes");
const companyRoutes = require("./companyRoutes");
const gstRoutes = require("./gstRoutes");
const prospectRoutes = require("./prospectRoute");
const documentRoutes = require("./documentRoutes");
const inventoryRoutes = require("./inventoryRoutes");



router.use("/api/auth", authRoutes);
router.use("/api/companies", companyRoutes);
router.use("/api/gst", gstRoutes);
router.use("/api/prospect", prospectRoutes);
router.use("/api/documents", documentRoutes);
router.use("/api/inventory", inventoryRoutes);


module.exports = router;
