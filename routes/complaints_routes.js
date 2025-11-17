const express=require('express')
const router=express.Router()
const authcontroller=require('../controllers/authcontroller')
const auth=require('../middleware/auth')


router.post('/addcomplaints',auth.authuser,authcontroller.addcomplaints)
router.post('/updatecomplaints',auth.authuser,auth.authorizeRoles["user","admin"],authcontroller.updateuser)
router.get('/viewcomplaints',auth.authuser,auth.authorizeRoles[admin],authcontroller.view_complaints)



module.exports=router
