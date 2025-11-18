const express=require('express')
const app=express()
require('dotenv').config()
var cors = require('cors')

const connectdb=require('./config/db')
connectdb()

const userroutes=require("./routes/userroutes")
const corsOptions = {
  origin: ['https://user-first-program-front-end.vercel.app','http://localhost:5173'], // must be exact frontend URL
  credentials: true, // allow cookies, headers, etc.
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions))  


app.use(express.json())
app.get('/',(req,res)=>{res.send("Welcome")})

app.use('/',userroutes)
app.listen(process.env.PORT,()=>{
    console.log(`Listening at port ${process.env.PORT}`)
})