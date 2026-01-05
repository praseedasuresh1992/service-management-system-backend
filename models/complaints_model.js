const mongoose=require('mongoose')

const complaintschema=new mongoose.Schema({

    user_id:{type:mongoose.Schema.Types.ObjectId,ref:"users"},
    provider_id:{type:mongoose.Schema.Types.ObjectId,ref:"providers",default: null},
    complaints_text:{type:String,required:true},
    status:{type:String,enum:["pending","resolved","rejected"],default:"pending",required:true},
    createdAt:{type:Date,required:true},
    resolvedAt:{type:Date}

}, { timestamps: true })

const complaints=mongoose.model('complaints',complaintschema)

module.exports=complaints