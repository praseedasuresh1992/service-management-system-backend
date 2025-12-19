const express=require('express')
const router=express.Router()
const providercontroller=require('../controllers/providercontroller')
const logincontroller=require("../controllers/login_controller")
const auth=require('../middleware/auth')


const upload = require("../config/upload");
const cloudinary = require("../config/cloudinary");

router.post(
  "/registerprovider",
  upload.fields([
    { name: "profile_image", maxCount: 1 },
    { name: "verification_document", maxCount: 10 }
  ]),
  providercontroller.addProvider
);

router.post('/login',logincontroller.loginUser)


router.post(
  "/updateprovider",
  auth.authuser,
  auth.authorizeRoles("provider"),
  uploadProfile.single("profile_image"),             // Single profile image
  uploadDocuments.array("verification_document", 10), // Multiple documents
  providercontroller.updateMyProfile
);

router.delete(
  "/delete-profile-image",
  auth.authuser,
  providercontroller.deleteProfileImage
);

router.delete(
  "/delete-document/:docId",
  auth.authuser,
  providercontroller.deleteDocument
);

router.put("/verifyprovider/:id",auth.authuser,auth.authorizeRoles("admin"),providercontroller.updateProviderStatus)

router.get('/viewallproviders',auth.authuser,auth.authorizeRoles("admin"),providercontroller.getProviders)
router.post('/filterProviderforbooking',auth.authuser,auth.authorizeRoles("user"),providercontroller.filterProviderforbooking )
router.get("/",auth.authuser,auth.authorizeRoles("provider"),providercontroller.viewMyProviderProfile )


router.get('/logoutprovider',logincontroller.logoutuser)



module.exports=router