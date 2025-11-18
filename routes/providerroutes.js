const express=require('express')
const router=express.Router()
const authcontroller=require('../controllers/authcontroller')
const auth=require('../middleware/auth')


router.post('/registerprovider',)
router.post('/updateprovider',)
router.post('/login',)
router.post('/deleteprovider',)
router.get('/providerprofile',)
router.get('/logoutprovider',)



module.exports=router
