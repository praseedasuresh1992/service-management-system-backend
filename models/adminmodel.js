const mongoose=require('mongoose')

const adminschema=new mongoose.Schema({

    name:{type:String,required:true},
    email:{type:String,required:true,unique:true},
    contactno:{type:String,required:true},
    username:{type:String,required:true,unique:true},
    password:{type:String,required:true},
    role:{type:String,default:"admin"}
}, { timestamps: true })

const admin=mongoose.model('admin',adminschema)

module.exports=admin