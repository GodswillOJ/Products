const { joiErrorFormatter, mongooseErrorFormatter } = require('../controllers/validatorFter');
const { User, validateClient } = require('../models/userSchema');
const bcrypt = require('bcrypt')
const mongoose = require('mongoose')
const randomString = require('randomstring')
const nodemailer = require('nodemailer')
require('dotenv').config()
require('../routes/userRoute')
require('../server')
const Post = require('../models/postSchema')

// loading register page
const loadRegister = async(req,res)=>{
    try {
        res.render('users/registration', {message: ''})
    } catch (error) {
        console.log(error.message)
    }
}

// user insert
const insertUser = async(req, res) => {
    console.log(req.body)
    const salt = await bcrypt.genSalt(15)
    const hashPassword = await bcrypt.hash(req.body.password, salt)
    const image = req.file.filename

    const my_order = await Order.find().populate({path:'orderItem'})

    try {
        const user = new User({
            username: req.body.username,
            firstname: req.body.firstname,
            lastname: req.body.lastname,
            email: req.body.email,
            mno: req.body.mno,
            details: req.body.details,
            password: hashPassword,
            orders: my_order,
            image: image,
            is_admin:0
        })

        const userData = await user.save();

        if(userData){
            sendVerifyMail(req.body.username, req.body.email, userData._id);
            console.log(userData)
            res.render('users/registration', {message: 'Registered Successfully. Please Check your mail for verification'})
        } else{
            res.render('users/registration', {message: 'Registration failed.'})
        }
    } catch (error) {
        console.log(error.message)
    }
}

const loadLogin = async(req,res) => {
    try{
        
        res.render('users/login', {message: ''})
    } catch (e) {
        console.log(e)
    }
}


/// To verify if its User
const verifyLogin = async (req,res)=>{
    console.log(req.body)
    try {

        const password = req.body.password;

        const userData = await User.findOne({username: req.body.username});
        console.log(userData)
        if(userData){
            const passwordMatch = await bcrypt.compare(password, userData.password);
            if (passwordMatch) {
                 if(userData.is_verified === 1 || userData.is_verified === 2) {
                    res.render('users/login', {message: 'No Such User'})
                 } 
                 else if (!userData){
                    res.redirect('/user/login')
                 }
                 else {
                    req.session.user_id = userData._id
                    console.log(userData._id)
                   return res.redirect('/user/home')
                 }

            } else {
             res.render('users/login', {message: 'Password is incorrect'})
            }
        } else {
            res.render('users/login', {message: 'User not in this database'})
        }
    } catch (e) {
        console.log(e)
    }
}

// For verify mail
port = process.env.port
emailUser = process.env.emailUser
emailPassword = process.env.emailPassword

const sendVerifyMail = async(username, email, user_id)=> {
    try {
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            requireTLS: true,
            auth: {
                user: emailUser,
                pass: emailPassword
            }
        });

        const mailOptions = {
            from: emailUser,
            to: email,
            subject: 'For Verification mail',
            html: '<p>Hii '+username+', please click here to <a href="http://localhost:4400/user/verify?id='+ user_id +'">Verify</a> your mail</p>'
        }
        transporter.sendMail(mailOptions, function(error, info){
            if (error) {
                console.log(error)
            } else {
                console.log('Email has been sent:-', info.response)
            }
        })
    } catch (error) {
        console.log(error.message)
    }
}

//Reset Password 

const sendResetPasswordMail = async(username, email, token)=> {
    try {

        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            requireTLS: true,
            auth: {
                user: emailUser,
                pass: emailPassword
            }
        });

        const mailOptions = {
            from: emailUser,
            to: email,
            subject: 'For Reset mail',
            html: '<p>Hii '+username+', please click here to <a href="http://localhost:4400/user/forget-password?token='+ token +'">Reset</a> your password</p>'
        }
        transporter.sendMail(mailOptions, function(error, info){
            if (error) {
                console.log(error)
            } else {
                console.log('Email has been sent:-', info.response)
            }
        })
    } catch (error) {
        console.log(error.message)
    }
}


///To load Home of User
const loadHome = async(req, res)=>{
    try {
       const  id = req.session.user_id
        const user = await User.findById({ _id: id })
        const data = await Post.find().populate({path:'category', select:['name']})
        

        if (!user) {
            res.render('home')
        } else {
            res.render('users/home', { 
                user,
                data
             })
        }
    } catch (error) {
        console.log(error)
    }
}

// for users
const saved = async (req, res, next) => {

    try {
        const locals = {
            title: 'Registered users',
            description: 'Simple Blog'
        }

        const id = req.params.id
        const userData = await User.findOne({ _id: id })
        console.log(userData)
        res.render('users/account', { data: userData })
    } catch (error) {
        console.log(error.message)
    }
}


// Forget load
const forgetLoad = async(req, res)=>    {
    try {
        res.render('users/forget')
    } catch (error) {
        console.log(error.message)
    }
}

// return veryfymail
const verifyMail = async (req, res) => {
    try {
        const id = req.query.id;
        const updateInfo = await User.updateOne({_id: id},{$set: { is_verified:0 }});
        console.log(updateInfo);
        res.render('users/email-verified')
    } catch (error) {
        
    }
}

// password verification

const forgetVerify = async(req, res) => {
        try {
            const email = req.body.email;
            const userData = await User.findOne({email: email})

            if (userData) {
                if(userData.is_verified === 1 || userData.is_verified === 2){
                    res.render('users/forget', { message: 'Please check your credentials' })
                } else {
                    const random_string  = randomString.generate();
                    const updatedData = await User.updateOne({email:email}, {$set: { token: random_string }}) 
                    sendResetPasswordMail(userData.username, userData.email, random_string)
                    res.render('users/forget', { message: 'Please check your mail to reset password.' })
                }
            } else {
                res.render('users/forget', {message: 'User email.is incorrect.'})
            }
        } catch (error) {
            console.log(error.message)
       }
}

// forgetPasswordload
const forgetPasswordLoad = async (req, res) => {
    try {
        const token = req.query.token
        const tokenData = await User.findOne({ token: token });
        console.log(tokenData)

        if (tokenData) {
            res.render('users/forget-password', { user_id:tokenData._id })
        } else {
            res.render('users/404', {message: 'Token is invalid'})
        }
        
    } catch (error) {
        console.log(error.message)
    }
}

const securePassword = async(password)=>{
    try {
        const hashPassword = await bcrypt.hash(password, 10);
        return hashPassword
    } catch (error) {
        console.log(error.message)
    }
}

const resetPassword = async(req, res)=>{
    try {
        
        const password = req.body.password;
        const user_id = req.body.user_id;

        const secure_password = await securePassword(password);
        console.log(secure_password)
        const updatedData = await  User.findByIdAndUpdate({ _id:user_id }, { $set: { password: secure_password, token: ''}});

        console.log(updatedData)
        res.redirect('/user/login')
    } catch (error) {
       console.log(error.message);
    }
}

// logout route
const logout = async(req,res)=>{
    try {
        req.session.destroy()
        res.redirect('/')
    } catch (e) {
        console.log(e)
    }
}


// verification load

const verificationLoad = async (req, res)=> {
    try {
        res.render('users/verification')
    } catch (error) {
        console.log(error.message)
    }
}

// verificationSent

const sentVerificationLink = async(req, res)=>{
    try {
        const email = req.body.email;
        const userData = await User.findOne({ email: email })

        if (userData) {
            sendVerifyMail(userData.username, userData.email, userData._id)
            res.render('users/verification', {message: 'Reset verification mail has been sent to your mail'})
        } else {
            res.render('users/verification',  {message: 'This email does not exist'})
        }
    } catch (error) {
        console.log(error.message)
    }
}



// User Profile

const userProfile = async(req, res)=>{
    try {
        const id = req.session.user_id
        const user = await User.findOne({ _id: id })

        res.render('users/account', { data: user, })
    } catch (error) {
        console.log(error.message)
    }
}


// const edit
const editUser = async(req, res)=>{
    try {
        const id = req.session.user_id;
        const user = await User.findById({_id: id})

        res.render('users/edit', { user })
    } catch (error) {
        console.log(error.message)
    }
}



const loadHomePost = async(req, res)=> {
    try {
        const data = await Post.find().populate({path:'category', select:['name']})
        
        console.log('user:', req.user)
        res.render('home', {
            data
        })
        
    } catch (error) {
        console.log(error)
    }
}
const loadCommodityPost = async(req, res)=> {
    try {
        const data = await Post.find().populate({path:'category', select:['name']})
        console.log('user:', req.user)
        res.render('commodity', {
            data
        })
        
    } catch (error) {
        console.log(error.message)
    }
}
const loadElectronicsPost = async(req, res)=> {
    try {
        const data = await Post.find().populate({path:'category', select:['name']})
        console.log('user:', req.user)
        res.render('electronics', {
            data
        })
        
    } catch (error) {
        console.log(error.message)
    }
}
const loadServicesPost = async(req, res)=> {
    try {
        const data = await Post.find().populate({path:'category', select:['name']})
        console.log('user:', req.user)
        res.render('services', {
            data
        })
        
    } catch (error) {
        console.log(error.message)
    }
}

// user_commodities

const loadUserCommodityPost = async(req, res)=> {
    try {
        const data = await Post.find().populate({path:'category', select:['name']})
        console.log('user:', req.user)
        res.render('users/commodity', {
            data
        })
        
    } catch (error) {
        console.log(error.message)
    }
}
const loadUserElectronicsPost = async(req, res)=> {
    try {
        const data = await Post.find().populate({path:'category', select:['name']})
        console.log('user:', req.user)
        res.render('users/electronics', {
            data
        })
        
    } catch (error) {
        console.log(error.message)
    }
}
const loadUserServicesPost = async(req, res)=> {
    try {
        const data = await Post.find().populate({path:'category', select:['name']})
        console.log('user:', req.user)
        res.render('users/services', {
            data
        })
        
    } catch (error) {
        console.log(error.message)
    }
}


const updateProfile = async(req, res) => {
    try {
        if(req.file){
            const update = await User.findByIdAndUpdate( {_id: req.body.user_id} , {$set: {
                username: req.body.username,
                firstname: req.body.firstname,
                lastname: req.body.lastname,
                details: req.body.details,
                mno: req.body.mno,
                email: req.body.email,
                password: req.body.password,
                image: req.file.filename
                }})
                res.redirect(`/user/edit/${req.body.user_id}`)
            }
            else{
              const update = await User.findByIdAndUpdate( {_id: req.body.user_id} , {$set: {
                username: req.body.username,
                firstname: req.body.firstname,
                lastname: req.body.lastname,
                details: req.body.details,
                mno: req.body.mno,
                email: req.body.email,
                password: req.body.password,
                }})
              res.redirect(`/user/edit/${req.body.user_id}`)
            }
    } catch (error) {
        console.log(error.message)
    }
} 

// rendering customer 
const sellerLoadProfile = async(req, res)=>{
    try {
        const data = await Post.findOne({ _id: req.query.id }).populate({path:'author'})
        console.log(data)
        res.render('users/seller', {
            data
        })
    } catch (error) {
        console.log(error.message)
    }
}

//post 
// const { request } = require('../routes/adminRoute');

// Orders information
const orderLoad = async(req, res)=> {
    try {
        const user = await User.findOne({_id: req.session.user_id})
        const cart = user.cart
        console.log(user)
        res.render('users/orders', {
            cart,
            user
        })
    } catch (error) {
        console.log(error.message)
    }
}

//  create order
function generateOrderNumber() {
    const prefix = 'ORD';
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2,5);

    return `${prefix}-${timestamp}-${random}`;
}

// confirmation mail
const sendOrderConfirmationEmail = async(email, orderNumber)=> {
    try {
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            requireTLS: true,
            auth: {
                user: emailUser,
                pass: emailPassword
            }
        });

        const mailOptions = {
            from: emailUser,
            to: email,
            subject: 'Order Confirmation',
            html: `<p>Your order with order number ${orderNumber} has been processed. Thank you for shopping with us!</p>`
        }
        transporter.sendMail(mailOptions, function(error, info){
            if (error) {
                console.log(error)
            } else {
                console.log('Email has been sent:-', info.response)
            }
        })
    } catch (error) {
        console.log(error.message)
    }
}

const {Order} = require('../models/orderSchema')

const orderItem = async(req, res) => {
    try {

        const order = await Order.findOne({orderItem: req.body.orderItem}).exec()
        console.log(order)
        console.log(req.body.orderItem)
        const user = await User.findOne({_id: req.session.user_id})
        const user_details = user.cart;
        console.log(user_details)

         // Generate order number
        const orderNumber = generateOrderNumber();
        // call other detail
        const name = user_details.items[0].name
        const productId = user_details.items[0].productId
        const quantity = user_details.items[0].quantity
        const price = user_details.items[0].price
        const image = user_details.items[0].image
        console.log(quantity)

        if(order){
            // Check if the product already exists in the order
            const itemIndex = order.orderDetails.items.find(product => product.productId.equals(productId));
            if(itemIndex){
                console.log(itemIndex)
                if(itemIndex){
                    order.orderDetails.totalPrice = order.orderDetails.totalPrice + parseInt(price),
                    // Update an existing product in the products array
                // Product already exists in the order, update quantity and price
                        itemIndex.quantity += quantity;
                        itemIndex.price += price;
                } else {
                    order.orderDetails.items.push({
                        name,
                        productId,
                        quantity,
                        price,
                        image,
                    })
                    console.log(user_details.items)
                    order.orderDetails.totalPrice += parseInt(price)
                }
                await order.save()
            }

            if(itemIndex){

                    if(user_details) {
                        user_details.items.splice(0)            
                        console.log(user_details.items)
                        user_details.totalPrice = user_details.totalPrice * 0 

                        user.orders.push(order)
                        
                    }
                    await user.save()
            }
            
        } else{
            console.log(req.body)
            const order = new Order({
                orderItem: req.body.orderItem,
                shippingAddress1:req.body.shippingAddress1,
                shippingAddress2: req.body.shippingAddress2,
                orderDetails: user_details,
                city: req.body.city,
                zip: req.body.zip,
                country: req.body.country,
                phone: req.body.phone,
                orderNumber: orderNumber,
                status: 'pending'
            })
            const productOrdered = await order.save()

            if(productOrdered){

                if(user_details) {
                    user_details.items.splice(0)            
                    console.log(user_details.items)
                    user_details.totalPrice = user_details.totalPrice * 0 

                    user.orders.push(productOrdered)
                    
                }
                await user.save()
            }

            try {
                await sendOrderConfirmationEmail(user.email, orderNumber);
             } catch (error) {
                console.error('Error sending order confirmation email:', error);
            }
        }

       const paymentData = {
        intent: 'sale',
        payer: {
          payment_method: 'paypal',
        },
        redirect_urls: {
          return_url: 'http://your-website.com/success',
          cancel_url: 'http://your-website.com/cancel',
        },
        transactions: [
          {
            amount: {
              total: user_details.totalPrice.toString(),
              currency: 'USD', // Change currency as needed
            },
            description: 'Your order description',
          },
        ],
      };
       
        res.redirect('/user/mycart')
    } catch (error) {
        console.log(error)
    }
}

const all_orders = async(req, res) => {
    try {
        const orderItem = req.session.user_id;
        const user = await User.findOne({_id: req.session.user_id})
        const user_order = await Order.find({orderItem: orderItem}).exec()
        const details = user_order.orderDetails;
        console.log(details)
        console.log(user_order)
        res.render('users/all_orders', {
            user,
            user_order,
            details
        })
    } catch (error) {
        console.log(error)
    }
}

    //   paypal.payment.create(paymentData, (error, payment) => {
    //     if (error) {
    //       console.error(error);
    //       res.status(500).json({ error: 'Internal Server Error' });
    //     } else {
    //       // Redirect the user to PayPal for approval
    //       res.redirect(payment.links[1].href);
    //     }
    //   });


    const Messages = require('../models/messages')
    const messageFetch = async(req, res) => {
    
        try {

            const user = await User.findOne({_id: req.session.user_id})
            
            const messages = await Messages.find({})
            
            console.log(messages)
            res.render('users/inbox', {
                messages,
                user
            })
        } catch (error) {
            console.error(error);
            res.send('Something went wrong')
        }
    
    }

    const MarkAsRead = async(req, res) => {
      
            const messageId = req.body.adminId;
            await Messages.findByIdAndUpdate(messageId, { isRead: true });
            res.send('OK');
          
    }
// paypal-config
const paypal = require('paypal-rest-sdk');

client_id = process.env.client_id
secret_pp = process.env.secret_pp

paypal.configure({
  mode: 'sandbox', // Change to 'live' for production
  client_id: client_id,
  client_secret: secret_pp,
});


module.exports = {
    messageFetch,
    MarkAsRead,
    all_orders,
    orderLoad,
    orderItem,
    loadRegister,
    insertUser,
    loadLogin,
    loadHome,
    loadHomePost,
    loadElectronicsPost,
    loadUserElectronicsPost,
    loadCommodityPost,
    loadUserCommodityPost,
    loadServicesPost,
    loadUserServicesPost,
    saved,
    verifyLogin,
    verifyMail,
    forgetLoad,
    forgetPasswordLoad,
    forgetVerify,
    resetPassword,
    verificationLoad,
    sentVerificationLink,
    userProfile,
    editUser,
    updateProfile,
    sellerLoadProfile,
    logout
}
