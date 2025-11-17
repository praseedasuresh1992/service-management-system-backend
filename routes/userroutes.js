const express=require('express')
const router=express.Router()
const usercontroller=require('../controllers/usercontroller')
const auth=require('../middleware/auth')


router.post('/register',auth.authuser,usercontroller.createuser)
router.post('/updateuser',auth.authuser,usercontroller.updateuser)
router.post('/login',authcontroller.loginUser)
router.post('/deleteuser',auth.authuser,usercontroller.deleteuser)
router.get('/profile',auth.authuser,auth.authorizeRoles[admin],auth.authuser,usercontroller.getprofile)
router.get('/logout',auth.authuser,usercontroller.logoutuser)



module.exports=router
