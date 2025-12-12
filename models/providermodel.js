const mongoose=require('mongoose')

const providerschema=new mongoose.Schema({

    profile_image:{url:{type:String },
     public_id: { type: String }},//cloudinary URL
    name:{type:String,required:true},
    email:{type:String,required:true,unique:true},
    is_group:{type:Boolean,default:false},
    members:{type:Number,default:1},
    address:{type:String,required:true},
    contactno:{type:String,required:true,match: /^[0-9]{10}$/},
    service_category:{type:mongoose.Schema.Types.ObjectId,ref:"service_category", required :true},
    available_location:{type:[String],required:true},
    verification_document: [
    {
        url: String,
        public_id: String
    }
    ],
    username:{type:String,required:true,unique:true},
    password:{type:String,required:true},
    status:{type:String,enum:["active","blocked","pending"],default:"pending"},
    verified:{type:Boolean,default:false},
    role:{type:String,default:"provider"}

}, { timestamps: true })

const provider=mongoose.model('providers',providerschema)

module.exports=provider