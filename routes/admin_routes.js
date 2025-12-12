const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admin_controller");

router.post("/addadmin", adminController.addAdmin);

module.exports = router;
