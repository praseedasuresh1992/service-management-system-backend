const mongoose=require('mongoose')
require('dotenv').config()
const mongoURI=process.env.MongoDBURI
console.log(mongoURI)
const connectDb=async()=>{
    try{
        const connect=await mongoose.connect(mongoURI)
        console.log(`connection success ${connect.connection.name}`)
    }
    catch(err){
        console.log(err.message)
    }
}
module.exports=connectDb