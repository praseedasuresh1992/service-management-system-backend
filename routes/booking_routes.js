const express=require('express')
const router=express.Router()
const authcontroller=require('../controllers/authcontroller')
const auth=require('../middleware/auth')


router.post('/registerbooking',)
router.post('/updatebooking/:id',)
router.post('/deletebooking/:id',)
router.get('/serviceprofile',)


module.exports=router
