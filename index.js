const express=require('express')
const app=express()
require('dotenv').config()
var cors = require('cors')

const connectdb=require('./config/db')
connectdb()

const userroutes=require("./routes/userroutes")
const providerroutes=require("./routes/providerroutes")
const bookingroutes=require("./routes/booking_routes")
const categoryroutes=require("./routes/category_routes")
const complaintroutes=require("./routes/complaints_routes")
const provideravailabiltyroutes=require("./routes/provider_availability_routes")
const corsOptions = {
  origin: ['http://localhost:5173'], // must be exact frontend URL
  credentials: true, // allow cookies, headers, etc.
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions))  


app.use(express.json())
app.get('/',(req,res)=>{res.send("Welcome")})

app.use('/',userroutes)
app.use('/',providerroutes)
app.use('/',bookingroutes)
app.use('/',categoryroutes)
app.use('/',complaintroutes)
app.use("/",provideravailabiltyroutes)

app.listen(process.env.PORT,()=>{
    console.log(`Listening at port ${process.env.PORT}`)
})