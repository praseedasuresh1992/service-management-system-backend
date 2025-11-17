const express=require('express')
const router=express.Router()
const authcontroller=require('../controllers/authcontroller')
const auth=require('../middleware/auth')


router.post('/registerprovider',auth.authuser,authcontroller.createprovider)
router.post('/updateprovider',auth.authuser,authcontroller.updateprovider)
router.post('/login',authcontroller.loginprovider)
router.post('/deleteprovider',auth.authuser,auth.authorizeRoles["admin"],authcontroller.deleteprovider)
router.get('/providerprofile',auth.authuser,authcontroller.get_provider_profile)
router.get('/logoutprovider',authcontroller.logoutprovider)



module.exports=router
