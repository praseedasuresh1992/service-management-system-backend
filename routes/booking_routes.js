const express=require('express')
const router=express.Router()
const authcontroller=require('../controllers/authcontroller')
const auth=require('../middleware/auth')


router.post('/registerbooking',authcontroller.addbookings)
router.post('/updatebooking/:id',authcontroller.updateservice)
router.post('/deletebooking/:id',authcontroller.deletebooking)
router.get('/serviceprofile',auth.authuser,authcontroller.get_service_profile)


module.exports=router
