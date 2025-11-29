const express=require('express')
const router=express.Router()
const complaintcontroller=require('../controllers/complaints_controller')
const auth=require('../middleware/auth')


router.post('/addcomplaints',auth.authuser,auth.authorizeRoles("user","provider"),complaintcontroller.createComplaint)
router.post('/updatecomplaintstatus/:id',auth.authuser,auth.authorizeRoles("admin"),complaintcontroller.updateComplaintStatus)
router.get('/viewcomplaintsByuser',auth.authuser,auth.authorizeRoles("user","provider"),complaintcontroller.getComplaintsByUser)
router.get('/viewcomplaintsByprovider',auth.authuser,auth.authorizeRoles("user","provider"),complaintcontroller.getComplaintsByProvider)
router.get('/viewAllcomplaints',auth.authuser,auth.authorizeRoles("admin"),complaintcontroller.getAllComplaints)




module.exports=router
