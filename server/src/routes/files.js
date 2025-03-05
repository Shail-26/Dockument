const express = require("express");
const { getUserFiles } = require("../controllers/fileController");
const limiter = require("../middleware/rateLimit");

const router = express.Router();

// Route to get user files
router.get("/user-files/:address", limiter, getUserFiles);

module.exports = router;
