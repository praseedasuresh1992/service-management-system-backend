const mongoose=require('mongoose')

const userschema=new mongoose.Schema({

    name:{type:String,required:true},
    email:{type:String,required:true,unique:true},
    address:{type:String,required:true},
    contactno:{type:String,required:true},
    username:{type:String,required:true,unique:true},
    password:{type:String,required:true}

}, { timestamps: true })

const user=mongoose.model('users',userschema)

module.exports=user