const mongoose=require('mongoose')

const userschema=new mongoose.Schema({

    name:{type:String,required:true},
    email:{type:String,required:true,unique:true},
    address:{type:String,required:true},
    contactno:{type:String,required:true,match: /^[0-9]{10}$/},
    username:{type:String,required:true,unique:true},
    password:{type:String,required:true,select: false},
    role:{type:String,default:"user"}

}, { timestamps: true })

const user=mongoose.model('users',userschema)

module.exports=user