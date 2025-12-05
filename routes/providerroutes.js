const express=require('express')
const router=express.Router()
const providercontroller=require('../controllers/providercontroller')
const logincontroller=require("../controllers/login_controller")
const auth=require('../middleware/auth')


router.post('/registerprovider',providercontroller.addProvider)

router.post('/login',logincontroller.loginUser)

router.post('/updateprovider',auth.authuser,providercontroller.updateMyProfile)
router.post("/verifyprovider/:id",providercontroller.updateProviderStatus)

router.get('/viewallproviders',providercontroller.getProviders)
router.get('/filterProviderforbooking',providercontroller.filterProviderforbooking )
router.get('/providerprofile/:id',providercontroller.providerProfile)
router.get("/viewMyProviderProfile",auth.authuser,providercontroller.getmyprofile)

router.delete('/deleteprovider/:id',providercontroller.deleteProvider)

router.get('/logoutprovider',logincontroller.logoutuser)



module.exports=router
