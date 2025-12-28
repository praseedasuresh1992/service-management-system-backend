const express=require('express')
const router=express.Router()
const bookingcontroller=require("../controllers/booking_controller")
const auth=require('../middleware/auth')


router.post('/createbooking',auth.authuser,auth.authorizeRoles("user"),bookingcontroller.createBookingAfterCheckout)
router.post('/calculateBookingAmount',auth.authuser,auth.authorizeRoles("user"),bookingcontroller.calculateBookingAmount)
//router.get('/viewbookings',auth.authuser,bookingcontroller.getAllBookings)
router.get('/viewMyBookings',auth.authuser,auth.authorizeRoles("user"),bookingcontroller.getMyBookings)
router.get(
  "/provider/:providerId",
  auth.authuser,
  bookingcontroller.getBookingsByProvider
);
router.get(
  "/viewAllBooking",
  auth.authuser,auth.authorizeRoles("provider"),
  bookingcontroller.getBookingsByProvider
);

router.put(
  "/updateBookingStatus/:bookingId/status",
  auth.authuser,auth.authorizeRoles("provider"),
  bookingcontroller.updateBookingStatus
);


router.get('/filteredbookings',auth.authuser,auth.authorizeRoles("provider","admin"),bookingcontroller.getFilteredBookings)

router.put('/updatebooking/:id',auth.authuser,auth.authorizeRoles("user"),bookingcontroller.updateBookingDetails)




module.exports=router
