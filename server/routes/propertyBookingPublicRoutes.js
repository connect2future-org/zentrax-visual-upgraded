const express = require("express");
const controller = require("../controllers/sunShreeBookingController");

const router = express.Router();
router.get("/settings", controller.getPublicSettings);

module.exports = router;
