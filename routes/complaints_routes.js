const express=require('express')
const router=express.Router()
const complaintcontroller=require('../controllers/complaints_controller')
const auth=require('../middleware/auth')


router.post('/addcomplaints',auth.authuser,auth.authorizeRoles("user","provider"),complaintcontroller.createComplaint)
router.patch(
  "/complaints/:id/status",
  auth.authuser,
  auth.authorizeRoles("admin"),
  complaintcontroller.updateComplaintStatus
);

router.get('/viewcomplaintsById/:id',auth.authuser,auth.authorizeRoles("admin"),complaintcontroller.getComplaintsByUser)
router.get('/viewAllcomplaints',auth.authuser,auth.authorizeRoles("admin"),complaintcontroller.getAllComplaints)




module.exports=router
