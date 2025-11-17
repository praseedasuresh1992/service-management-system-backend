const express=require('express')
const router=express.Router()
const authcontroller=require('../controllers/authcontroller')
const auth=require('../middleware/auth')


router.post('/addcategory',auth.authorizeRoles[admin],authcontroller.add_category)
router.post('/updatecategory',auth.authorizeRoles[admin],authcontroller.update_category)
router.post('/deletecategory',auth.authorizeRoles[admin],authcontroller.deletecategory)
router.get('/viewcategory',auth.authuser,authcontroller.view_category)


module.exports=router
