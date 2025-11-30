const mongoose=require('mongoose')

const paymentschema=new mongoose.Schema({

    booking_id:{type:mongoose.Schema.Types.ObjectId,ref:"bookings",required:true},
    user_id:{type:mongoose.Schema.Types.ObjectId,ref:"users",required:true},
    provider_id:{type:mongoose.Schema.Types.ObjectId,ref:"providers",required:true},
    amount:{type:Number,required:true},
    method:{type:String,required:true},
    status:{type:String,enum:["pending","completed","cancelled"],default:"pending",required:true}

}, { timestamps: true })

const payments=mongoose.model('payments',paymentschema)

module.exports=payments