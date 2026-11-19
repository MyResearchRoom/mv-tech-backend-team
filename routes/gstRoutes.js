
const express = require("express");
const router = express.Router();
const authenticate = require("../middlewares/authMiddleware");
const { fetchGSTDetails } = require("../controllers/gstController");

router.post(
    "/fetch-details", 
    authenticate(),
    fetchGSTDetails
);

module.exports = router;
