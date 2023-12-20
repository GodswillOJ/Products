const { joiErrorFormatter, mongooseErrorFormatter } = require('../controllers/validatorFter');
const { User, validateClient } = require('../models/userSchema');
const bcrypt = require('bcrypt')
const mongoose = require('mongoose')
const randomString = require('randomstring')
const nodemailer = require('nodemailer');
require('dotenv').config()
require('../routes/adminRoute')
require('../server')


// loading register page
const LoadRegister = async(req, res)=>{
    try {
        res.render('admin/registration')
    } catch (error) {
        console.log(error.message)
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
            html: '<p>Hii '+username+', please click here to <a href="http://localhost:4400/admin/verify?id='+ user_id +'">Verify</a> your mail</p>'
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

//  mail verification
const verifyMail = async (req, res) => {
    try {
        const id = req.query.id;
        const updateInfo = await User.updateOne({_id: id},{$set: { is_verified:1 }});
        console.log(updateInfo);
        res.render('admin/email-verify')
    } catch (error) {
        
    }
}

// for added user

const addedSendVerifyMail = async(username, email, user_id)=> {
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



// verify password
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
            html: '<p>Hii '+username+', please click here to <a href="http://localhost:4400/admin/forget-password?token='+ token +'">Reset</a> your password</p>'
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

// password verification

const forgetVerify = async(req, res) => {
    try {
        const email = req.body.email;
        const userData = await User.findOne({email: email})

        if (userData) {
            if(userData.is_verified === 0 || userData.is_verified === 2){
                res.render('users/forget', { message: 'Please check your credentials' })
            } else {
                const random_string  = randomString.generate();
                const updatedData = await User.updateOne({email:email}, {$set: { token: random_string }}) 
                sendResetPasswordMail(userData.username, userData.email, random_string)
                res.render('admin/forget', { message: 'Please check your mail to reset password.' })
            }
        } else {
            res.render('admin/forget', {message: 'User email.is incorrect.'})
        }
    } catch (error) {
        console.log(error.message)
   }
}

// forgetPasswordload
// Forget load
const forgetLoad = async(req, res)=> {
    try {
        res.render('admin/forget')
    } catch (error) {
        console.log(error.message)
    }
}

const forgetPasswordLoad = async (req, res) => {
try {
    const token = req.query.token
    const tokenData = await User.findOne({ token: token });
    console.log(tokenData)

    if (tokenData) {
        res.render('admin/forget-password', { user_id:tokenData._id })
    } else {
        res.render('admin/404', {message: 'Token is invalid'})
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

const resetAdminPassword = async(req, res)=>{
try {
    
    const password = req.body.password;
    const user_id = req.body.user_id;

    const secure_password = await securePassword(password);
    console.log(secure_password)
    const updatedData = await  User.findByIdAndUpdate({ _id:user_id }, { $set: { password: secure_password, token: ''}});

    console.log(updatedData)
    res.redirect('/admin/login')
} catch (error) {
   console.log(error.message);
}
}


// user insert
const insertAdmin = async(req, res) => {
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
            is_admin:1
        })

        const userData = await user.save();

        if(userData){
            sendVerifyMail(req.body.username, req.body.email, userData._id);
            console.log(userData)
            res.render('admin/registration', {message: 'Registered Successfully. Please Check your mail for verification'})
        } else{
            res.render('admin/registration', {message: 'Registration failed.'})
        }
    } catch (error) {
        console.log(error.message)
    }
}

const adminLoginLoad = async (req, res)=>{
    try {
        res.render('admin/login')
    } catch (error) {
        console.log(error.message)
    }
}


const verifyLogin = async(req, res)=>{
    try {
        const username = req.body.username;
        const password = req.body.password;

        const userData = await User.findOne({username:username})
        if (userData) {
            
           const passwordMatch = await bcrypt.compare(password, userData.password)

           if (passwordMatch) {
            
            if(userData.is_admin === 0 || userData.is_admin === 2){

                res.render('admin/login', {message: 'You are not admin'})

            } else {
                req.session.user_id = userData._id;
                res.redirect('/admin/home')
            }
            

           } else {
            res.render('admin/login', {message: 'Username and password incorrect'})
           }

        } else {
            res.render('admin/login', {message: ' No Such User '})
        }

    } catch (error) {
        console.log(error)
    }
}

// admin home

const LoadHome = async(req, res)=> {
    try {
        const  id = req.session.user_id
        const admin = await User.findById({ _id: id })
        res.render('admin/home', { admin })

    } catch (error) {
        console.log(error.message)
    }
}

// dashboard

const loadDashboard = async (req, res) => {
    let perPage = 12;
    let page = req.query.page || 1;

    try {
        const locals = {
            title: 'Dashboard',
            description: 'Simple Blog'
        }
    const data = await User.aggregate( [ {$sort: {updateAt: -1} } ])
        .skip(perPage * page - perPage)
        .limit(perPage)
        .exec();
    const count = await User.count();

    if (data.is_admin === 1 || data.is_admin === 2) {
        res.redirect('/admin/login')
        console.log('no users')
    } 
    else {
        res.render('admin/dashboard', {
            locals,
            data,
            current: page,
            pages: Math.ceil(count / perPage)
        })
    }

    } catch (error) {
        console.log(error)
    }
}


// edit 
const edit = async (req, res, next) => {
    try {
        // const id = new mongoose.Types.ObjectId(req.query.id);
        let id = req.params.id;
        const userData = await User.findById({ _id: id })
        if(userData){
            res.render('admin/edit', {
                user: userData
            })
        } else{
            res.redirect('/admin/dashboard')
        }
        console.log(req.params.id)
    } catch (error) {
        console.log(error)
    }
}

const UpdateUsers = async (req, res, next) => {
    let id = req.params.id

    try {
        if(req.file){
        const update = await User.findByIdAndUpdate( id , {$set: {
            username: req.body.username,
            firstname: req.body.firstname,
            lastname: req.body.lastname,
            details: req.body.details,
            mno: req.body.mno,
            email: req.body.email,
            password: req.body.password,
            image: req.file.filename
            }})
            res.redirect(`/admin/edit/${req.params.id}`)
        }
        else{
          const update = await User.findByIdAndUpdate( id , {$set:req.body})
          res.redirect(`/admin/edit/${req.params.id}`)
        }
    } catch (error) {
        console.log(error.message)
    }
}

const adminProfile = async(req, res, next)=>{
    try {
        const id = req.session.user_id
        const user = await User.findOne({ _id: id })

        res.render('admin/account', { data: user })
    } catch (error) {
        console.log(error.message)
    }
}

const editAdminLoad = async(req, res, next) =>{
    try {
        let id = req.session.user_id

        const admin = await User.findById({ _id: id })

        if (admin) {
            res.render('admin/editAdmin', { user: admin })
        } else {
            res.render('/')
        }
        console.log(req.params.id)
    } catch (error) {
        console.log(error.message)
    }
}

const editAdminProfile = async(req, res, next)=>{
    let id = req.session.user_id

    try {
        if(req.file){
        const update = await User.findByIdAndUpdate( id , {$set: {
            username: req.body.username,
            firstname: req.body.firstname,
            lastname: req.body.lastname,
            details: req.body.details,
            mno: req.body.mno,
            email: req.body.email,
            password: req.body.password,
            image: req.file.filename
            }})
            res.redirect(`/admin/edit/${req.params.id}`)
        }
        else{
          const update = await User.findByIdAndUpdate( id , {$set:req.body})
          res.redirect(`/admin/edit/${req.session.user_id}`)
        }
    } catch (error) {
        console.log(error.message)
    }
}

const addLoad = async(req, res, next) => {
    try {
        res.render('admin/add')
    } catch (error) {
        console.log(error.message)
    }
}

const addUser = async (req, res) => {
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
                 addedSendVerifyMail(req.body.username, req.body.email, userData._id)
                  console.log(userData)
                  res.render('admin/add', {message: 'Registered Successfully. Please Check your mail for verification'})
              } else{
                  res.render('admin/add', {message: 'Registration failed.'})
              }
        } catch (e) {
            console.log(e.message)
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
        const data = await User.findOne({ _id: id })
        console.log(data)
        res.render('admin/users', { locals, data })
    } catch (error) {
        console.log(error.message)
    }
}

// delete users
const deleteUser = async(req, res)=>{
    try {
        const id = req.params.id;
        await User.deleteOne({ _id: id })
        res.redirect('/admin/dashboard')

    } catch (error) {
        console.log(error.message)
    }
}





// Admin Post

const Purchase = require('../models/purchasedSchema');
const Category = require('../models/category');

// const { request } = require('../routes/adminRoute');


//calling post route

const Post = require('../models/postSchema')
const loadHomePost = async(req, res)=> {
    try {

        const  id = req.session.user_id
        const admin = await User.findById({ _id: id })
        const category = req.params.id;
        const data = await Post.find().populate({path:'category', select:['name']})

        res.render('admin/home', {
            admin,
            data
        })
        
    } catch (error) {
        console.log(error.message)
    }
}

const loadAllPost  = async(req, res)=> {
    try {

        const  id = req.session.user_id
        const admin = await User.findById({ _id: id })
        // Post.find().then(function(all_posts) {
        //     res.render('admin/post', {
        //         data: all_posts,
        //         admin
        //     })
        // })
        const data = await Post.find({})
        res.render('admin/post', { data, admin })
    } catch (error) {
        console.log(error.message)
    }
}
 
const viewAdded = async(req, res)=>{
    try {

        const data = await Post.findOne({ _id: req.query.id });
        const post_data = await Post.find({})

        res.render('admin/view-added', { data, post_data })

    } catch (error) {
        console.log(error.message)
    }
}


// category
const loadCategory = async(req, res)=> {
    try {
        const category = await Category.find({ })

        res.render('admin/category', { category })
    } catch (error) {
        console.log(error.message)
    }
}

const postCategory = async(req, res)=> {
    let category = new Category({
        name: req.body.name,
        tags: req.body.tags,
        description: req.body.description
    })
        category = await category.save()

    if (category) {
        try {
    
            res.redirect('/admin/edit-category')
        } catch (error) {
            console.log(error)
        }
    } else {
        res.redirect('admin/category', {message: 'No category added'})
    }
}

// user_commodities
const loadAdminCommodityPost = async(req, res)=> {
    try {
        const data = await Post.find().populate({path:'category', select:['name']})
        console.log('user:', req.user)
        res.render('user/commodity', {
            data
        })
        
    } catch (error) {
        console.log(error.message)
    }
}
const loadAdminElectronicsPost = async(req, res)=> {
    try {
        const data = await Post.find().populate({path:'category', select:['name']})
        console.log('user:', req.user)
        res.render('user/electronics', {
            data
        })
        
    } catch (error) {
        console.log(error.message)
    }
}
const loadAdminServicesPost = async(req, res)=> {
    try {
        const data = await Post.find().populate({path:'category', select:['name']})
        console.log('user:', req.user)
        res.render('user/services', {
            data
        })
        
    } catch (error) {
        console.log(error.message)
    }
}


const Messages = require('../models/messages')

const loadMessage = async(req, res) => {
    try {
        res.render('admin/add-message')
    } catch (error) {
        console.log(error)
    }
}

const newMessage = async(req, res) => {
    try {
        const sender = req.body.sender;
        console.log(req.body)

        // Check if the sender is an admin
        const isAdmin = sender === 'admin';
        if (isAdmin) {
            // Example: If you have an authentication system, retrieve the adminId from the token or session
            // adminId = req.user.adminId;
            // For simplicity, you might hardcode the adminId in a real application

            // Example: Hardcoding adminId (replace with actual adminId in your case)
            const id = req.session.user_id;
            const admin = await User.findById({_id: id})
            const adminId = admin._id

            const message = new Messages({ 
                 sender: req.body.sender,
                 title: req.body.title,
                 receiver: req.body.receiver, 
                 content: req.body.content, 
                 adminId: adminId
                
            });
            await message.save();

            // Set isRead to true for messages sent by admin
            if (isAdmin) {
                message.isRead = true;
            }
            await message.save();
            console.log(message)
            res.render('admin/add-message', { message: 'message sent successfully' })
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

// const markAsRead = async(req, res) => {
//     try {
//         const _id = req.params.id;
//         const message = await Messages.findByIdAndUpdate(_id, { isRead: true }, { new: true });
//         res.json(message);
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ error: 'Internal Server Error' });
//     }
// }

module.exports = {
    newMessage,
    // markAsRead,
    LoadRegister,
    insertAdmin,
    adminLoginLoad,
    verifyLogin,
    LoadHome,
    loadAdminCommodityPost,
    loadAdminElectronicsPost,
    loadAdminServicesPost,
    loadDashboard,
    adminProfile,
    verifyMail,
    forgetPasswordLoad,
    resetAdminPassword,
    forgetVerify,
    forgetLoad,
    edit,
    UpdateUsers,
    editAdminLoad,
    editAdminProfile,
    addUser,
    addLoad,
    saved,
    deleteUser,
    loadMessage,
    loadHomePost,
    loadAllPost,
    viewAdded,
    loadCategory,
    postCategory
}



