const express = require("express");
const router = express.Router();
const ratingController = require("../controllers/rating_controller");
const auth = require("../middleware/auth");

// ⭐ Create rating
router.post("/createrating", auth.authuser,auth.authorizeRoles("user") ,ratingController.createRating);

// ⭐ Provider profile ratings
router.get(
  "/provider/:provider_id",auth.authuser,
  auth.authorizeRoles("provider"),
  ratingController.getRatingsByProvider
);

// ⭐ Admin
router.get("/all", ratingController.getAllRatings);

module.exports = router;
