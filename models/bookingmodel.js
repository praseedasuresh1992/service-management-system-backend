const mongoose=require('mongoose')

const bookingschema=new mongoose.Schema({

    user_id:{type:mongoose.Schema.Types.ObjectId,ref:"users",required:true},
    provider_id:{type:mongoose.Schema.Types.ObjectId,ref:"providers",required:true},
    category_id:{type:mongoose.Schema.Types.ObjectId,ref:"service_category",required:true},
    start_datetime: {type: Date,required: true},
    end_datetime: {type: Date,required: true},
    location:{type:String,required:true},
    amount:{type:Number,required:true},
    status:{type:String,enum:["pending","accepted","completed","cancelled"],default:"pending",required:true}

}, { timestamps: true })

const booking=mongoose.model('bookings',bookingschema)

module.exports=booking