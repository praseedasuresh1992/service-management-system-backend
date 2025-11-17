const express=require('express')
const router=express.Router()
const authcontroller=require('../controllers/authcontroller')
const auth=require('../middleware/auth')


router.post('/addrating',auth.authuser,authcontroller.addrating)
router.get('/viewrating',auth.authuser,authcontroller.viewrating)



module.exports=router
