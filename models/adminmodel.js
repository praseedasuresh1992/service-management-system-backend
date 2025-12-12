const mongoose=require('mongoose')

const adminschema=new mongoose.Schema({

    name:{type:String,required:true},
    email:{type:String,required:true,unique: true, lowercase: true, trim: true},
    contactno:{type:String,required:true,match: /^[0-9]{10}$/},
    username:{type:String,required:true,unique:true},
    password:{type:String,required:true,},
    role:{type:String, enum: ["admin"],default:"admin"}
}, { timestamps: true })

const admin=mongoose.model('admin',adminschema)

module.exports=admin