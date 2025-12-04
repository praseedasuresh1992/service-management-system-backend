const express = require('express');
const app = express();
require('dotenv').config();
var cors = require('cors');
const cookieParser = require("cookie-parser");  // ✅ ADD THIS

const connectdb = require('./config/db');
connectdb();

// CORS (must allow credentials)
const corsOptions = {
  origin: [
    'https://servicemanagementsystemclient.onrender.com',
    'http://localhost:5173'
  ],
  credentials: true,  // 🔥 VERY IMPORTANT
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.use(cookieParser());          // 🚀 NOW BACKEND CAN READ COOKIES
app.use(express.json());

// Routes
app.get('/', (req, res) => { res.send("Welcome to Service management system") });

app.use('/', require("./routes/userroutes"));
app.use('/', require("./routes/providerroutes"));
app.use('/', require("./routes/booking_routes"));
app.use('/', require("./routes/category_routes"));
app.use('/', require("./routes/complaints_routes"));
app.use('/', require("./routes/provider_availability_routes"));
app.use('/', require('./routes/payment_routes'));
app.use('/', require("./routes/ratingroutes"));

app.listen(process.env.PORT, () => {
  console.log(`Listening at port ${process.env.PORT}`);
});
