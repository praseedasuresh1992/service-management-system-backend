const express=require('express')
const router=express.Router()
const complaintcontroller=require('../controllers/complaints_controller')
const auth=require('../middleware/auth')


router.post('/addcomplaints',complaintcontroller.createComplaint)
router.post('/updatecomplaintstatus/:id',complaintcontroller.updateComplaintStatus)
router.get('/viewcomplaintsByuser',complaintcontroller.getComplaintsByUser)
router.get('/viewcomplaintsByprovider',complaintcontroller.getComplaintsByProvider)
router.get('/viewAllcomplaints',complaintcontroller.getAllComplaints)




module.exports=router
