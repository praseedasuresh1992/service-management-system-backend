const express=require('express')
const router=express.Router()
const bookingcontroller=require("../controllers/booking_controller")
const auth=require('../middleware/auth')
const booking = require('../models/bookingmodel')


router.post('/createbooking',auth.authuser,auth.authorizeRoles("user"),bookingcontroller.createBooking)
router.get('/viewbookings',auth.authuser,bookingcontroller.getAllBookings)
router.get('/filteredbookings',auth.authuser,auth.authorizeRoles("providers","admin"),bookingcontroller.getFilteredBookings)

router.put('/updateBookingStatus/:id',auth.authuser,auth.authorizeRoles("providers","admin"),bookingcontroller.updateBookingStatus)
router.put('/updatebooking/:id',auth.authuser,auth.authorizeRoles("user"),bookingcontroller.updateBookingDetails)

router.post('/deletebooking/:id',bookingcontroller.deleteBooking)


module.exports=router
