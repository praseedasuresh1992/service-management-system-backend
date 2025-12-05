const express=require('express')
const router=express.Router()
const categorycontroller=require("../controllers/service_category_controller")
const auth=require('../middleware/auth')


router.post('/addcategory',categorycontroller.createcategory)
router.get('/viewcategory',categorycontroller.viewAllCategory)

router.put('/updatecategory/:id',auth.authuser,auth.authorizeRoles("admin"),categorycontroller.updatecategory)
router.delete('/deletecategory/:id',auth.authuser,auth.authorizeRoles("admin"),categorycontroller.deleteCategory)


module.exports=router