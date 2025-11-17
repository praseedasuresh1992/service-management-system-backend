const mongoose=require('mongoose')

const providerschema=new mongoose.Schema({

    profile_image:{type:String},
    name:{type:String,required:true},
    email:{type:String,required:true,unique:true},
    is_group:{type:Boolean},
    members:{type:number},
    address:{type:String,required:true},
    contactno:{type:String,required:true},
    available_location:{type:String,required:true},
    username:{type:String,required:true,unique:true},
    password:{type:String,required:true},
    status:{type:Boolean,Enum:[active,blocked,pending]},
    verified:{type:Boolean}

}, { timestamps: true })

const provider=mongoose.model('providers',providerschema)

module.exports=provider