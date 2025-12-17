const express = require('express')
const router = express.Router()
const usercontroller = require('../controllers/usercontroller')
const logincontroller=require("../controllers/login_controller")
const auth = require('../middleware/auth')

router.post('/registeruser', usercontroller.createuser)
router.post('/login', logincontroller.loginUser)
router.delete('/deleteuser/:id',auth.authuser,auth.authorizeRoles('admin'), usercontroller.deleteuser)

router.put("/updateMyUserProfile",auth.authuser,auth.authorizeRoles("user"),usercontroller.updateProfile)
router.get('/viewAllUsers',auth.authuser,auth.authorizeRoles("admin"),usercontroller.viewuser)
router.get("/ViewMyUserProfile",auth.authuser,auth.authorizeRoles("user"),usercontroller.getMyUserProfile)
router.post('/logout',  logincontroller.logoutuser)

module.exports = router
