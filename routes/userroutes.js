const express = require('express')
const router = express.Router()
const usercontroller = require('../controllers/usercontroller')
const auth = require('../middleware/auth')

router.post('/register', auth.authuser, usercontroller.createuser)
router.post('/login', usercontroller.loginUser)
// router.post('/deleteuser', auth.authuser, usercontroller.deleteuser)


router.get(
  '/profile',
  auth.authuser,
  auth.authorizeRoles("admin"),
  usercontroller.viewuser
)

router.get('/logout', auth.authuser, usercontroller.logoutuser)

module.exports = router
