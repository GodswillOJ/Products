const express = require('express')
const app = express()
require('dotenv').config()
require('./utilis/db.configure')

// user_route
const userRoute = require('./routes/userRoute');
app.use('/', userRoute)

// seller_route
const sellerRoute = require('./routes/sellerRoute');
app.use('/', sellerRoute)

// admin_route
const adminRoute = require('./routes/adminRoute');
app.use('/', adminRoute)


port = process.env.port



app.listen(port, ()=> {
    console.log(`listening at port ${port}`)
})