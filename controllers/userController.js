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

    try {
        const user = new User({
            username: req.body.username,
            firstname: req.body.firstname,
            lastname: req.body.lastname,
            email: req.body.email,
            mno: req.body.mno,
            details: req.body.details,
            password: hashPassword,
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

        res.render('users/account', { data: user })
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


// Orders information
const orderLoad = async(req, res)=> {
    try {
        const user = await User.findOne({_id: req.session.user_id})
        const cart = user.cart
        res.render('users/orders', {
            cart,
            user
        })
    } catch (error) {
        console.log(error.message)
    }
}

//  create order
const orderItem = async(req, res) => {
    try {
        console.log(req.body)
        order = new orderItem({

        })
    } catch (error) {
        console.log(error)
    }
}


module.exports = {
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
