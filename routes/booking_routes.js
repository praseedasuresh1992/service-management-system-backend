const express=require('express')
const router=express.Router()
const bookingcontroller=require("../controllers/booking_controller")
const auth=require('../middleware/auth')


router.post('/createbooking',auth.authuser,bookingcontroller.createBooking)
// router.post('/updatebooking/:id',)
// router.post('/deletebooking/:id',)
// router.get('/serviceprofile',)


module.exports=router
