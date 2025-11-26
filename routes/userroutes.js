const express = require('express')
const router = express.Router()
const usercontroller = require('../controllers/usercontroller')
const logincontroller=require("../controllers/login_controller")
const auth = require('../middleware/auth')

router.post('/register', usercontroller.createuser)
router.post('/login', logincontroller.loginUser)
router.delete('/deleteuser/:id',auth.authuser,auth.authorizeRoles('admin'), usercontroller.deleteuser)
router.get('/profile',usercontroller.viewuser)
router.get('/logout', auth.authuser, logincontroller.logoutuser)

module.exports = router
