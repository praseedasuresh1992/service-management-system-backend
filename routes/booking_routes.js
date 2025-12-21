const express=require('express')
const router=express.Router()
const bookingcontroller=require("../controllers/booking_controller")
const auth=require('../middleware/auth')


router.post('/create-checkout-session',auth.authuser,auth.authorizeRoles("user"),bookingcontroller.createBookingAfterCheckout)
router.post('/calculateBookingAmount',auth.authuser,auth.authorizeRoles("user"),bookingcontroller.calculateBookingAmount)
router.get('/viewbookings',auth.authuser,bookingcontroller.getAllBookings)
router.get('/viewMyBookings',auth.authuser,auth.authorizeRoles("user"),bookingcontroller.getMyBookings)
router.get(
  "/provider/:providerId",
  auth.authuser,
  bookingcontroller.getBookingsByProvider
);


router.get('/filteredbookings',auth.authuser,auth.authorizeRoles("providers","admin"),bookingcontroller.getFilteredBookings)

router.put('/updateBookingStatus/:id',auth.authuser,auth.authorizeRoles("providers","admin"),bookingcontroller.updateBookingStatus)
router.put('/updatebooking/:id',auth.authuser,auth.authorizeRoles("user"),bookingcontroller.updateBookingDetails)


router.post('/deletebooking/:id',bookingcontroller.deleteBooking)


module.exports=router
