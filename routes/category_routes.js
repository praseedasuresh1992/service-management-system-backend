const express = require('express');
const router = express.Router();
const categorycontroller = require("../controllers/service_category_controller");
const auth = require('../middleware/auth');

router.post(
  '/service-category',
  auth.authuser,
  auth.authorizeRoles("admin"),
  categorycontroller.createcategory
);

router.get(
  '/service-category',
  auth.authuser,
  auth.authorizeRoles("admin","user","provider"),
  categorycontroller.viewAllCategory
);

router.put(
  '/service-category/:id',
  auth.authuser,
  auth.authorizeRoles("admin"),
  categorycontroller.updatecategory
);

router.delete(
  '/service-category/:id',
  auth.authuser,
  auth.authorizeRoles("admin"),
  categorycontroller.deleteCategory
);

module.exports = router;
