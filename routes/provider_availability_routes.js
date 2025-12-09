const express=require('express')
const router=express.Router()
const provider_availability_controller=require("../controllers/provider_availability_controller")
const auth=require('../middleware/auth')


router.post('/addProviderAvailability',auth.authuser,auth.authorizeRoles("provider"),provider_availability_controller.createAvailability)
router.get('/viewProviderAvailability/:provider_id',auth.authuser,auth.authorizeRoles("user","admin","provider"),provider_availability_controller.getProviderAvailabity)
router.put('/updateProviderAvailability/:provider_id/slot/:slot_id"',provider_availability_controller.updateAvailabilitySlot)
router.get('/getproviderByAvailability',provider_availability_controller.filterProvidersByAvailability)
router.put('/deleteProviderAvailabilitySlot',provider_availability_controller.deleteAvailabilitySlot)




module.exports=router
