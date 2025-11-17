const mongoose=require('mongoose')

const commentschema=new mongoose.Schema({

    user_id:{type:mongoose.Schema.Types.ObjectId,ref:"users",required:true},
    provider_id:{type:mongoose.Schema.Types.ObjectId,ref:"providers",required:true},
    category_id:{type:mongoose.Schema.Types.ObjectId,ref:"service_category",required:true},
    rating:{type:String,required:true},
    comments:{type:string,required:true},
}, { timestamps: true })

const comments=mongoose.model('comments',commentschema)

module.exports=comments