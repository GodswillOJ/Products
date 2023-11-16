const { joiErrorFormatter, mongooseErrorFormatter } = require('../controllers/validatorFter');
const { User, validateClient } = require('../models/userSchema');
const bcrypt = require('bcrypt')
const mongoose = require('mongoose')
const randomString = require('randomstring')
const nodemailer = require('nodemailer');
require('dotenv').config()
require('../routes/sellerRoute')
require('../server')

// loading register page
const LoadRegister = async(req, res)=>{
    try {
        res.render('seller/registration', {
        })
    } catch (error) {
        console.log(error)
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
            html: '<p>Hii '+username+', please click here to <a href="http://localhost:4400/seller/verify?id='+ user_id +'">Verify</a> your mail</p>'
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
        res.render('seller/email-verify')
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
            html: '<p>Hii '+username+', please click here to <a href="http://localhost:4400/seller/verify?id='+ user_id +'">Verify</a> your mail</p>'
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
            html: '<p>Hii '+username+', please click here to <a href="http://localhost:4400/seller/forget-password?token='+ token +'">Reset</a> your password</p>'
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
                res.render('seller/forget', { message: 'Please check your credentials' })
            } else {
                const random_string  = randomString.generate();
                const updatedData = await User.updateOne({email:email}, {$set: { token: random_string }}) 
                sendResetPasswordMail(userData.username, userData.email, random_string)
                res.render('seller/forget', { message: 'Please check your mail to reset password.' })
            }
        } else {
            res.render('seller/forget', {message: 'User email.is incorrect.'})
        }
    } catch (error) {
        console.log(error.message)
   }
}

// forgetPasswordload
// Forget load
const forgetLoad = async(req, res)=> {
    try {
        res.render('seller/forget')
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
        res.render('seller/forget-password', { user_id:tokenData._id })
    } else {
        res.render('seller/404', {message: 'Token is invalid'})
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
    res.redirect('/seller/login')
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
            post: req.body.post,
            details: req.body.details,
            password: hashPassword,
            image: image,
            is_admin:2
        })

        const userData = await user.save();

        if(userData){
            sendVerifyMail(req.body.username, req.body.email, userData._id);
            console.log(userData)

            res.render('seller/registration', {message: 'Registered Successfully. Please Check your mail for verification'})
        } else{
            res.render('seller/registration', {message: 'Registration failed.'})
        }
    } catch (error) {
        console.log(error.message)
    }
}

const adminLoginLoad = async (req, res)=>{
    try {
        res.render('seller/login')
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
            
            if(userData.is_admin === 0 || userData.is_admin === 1){

                res.render('seller/login', {message: 'You are not yet registered'})

            } else {
                req.session.user_id = userData._id;
                res.redirect('/seller/home')
            }
            

           } else {
            res.render('seller/login', {message: 'Username and password incorrect'})
           }

        } else {
            res.render('seller/login', {message: ' No Such User '})
        }

    } catch (error) {
        console.log(error)
    }
}

// admin home

// const LoadHome = async(req, res)=> {
//     try {
//         const  id = req.session.user_id
//         const admin = await User.findById({ _id: id })
//         const post = await Post.find().exec()
//         res.render('seller/home', { 
//             admin, 
//             post
//          })

//     } catch (error) {
//         console.log(error)
//     }
// }

// dashboard

const loadDashboard = async (req, res) => {
    let perPage = 12;
    let page = req.query.page || 1;

    try {
        const locals = {
            title: 'Dashboard',
            description: 'Simple Blog'
        }
    const data = await User.aggregate( [ { $match : { is_admin: 0 } }, {$sort: {updateAt: -1} } ])
        .skip(perPage * page - perPage)
        .limit(perPage)
        .exec();
    const count = await User.count();

    if (data.is_admin === 1 || data.is_admin === 2) {
        res.redirect('/seller/login')
        console.log('no users')
    } 
    else {
        res.render('seller/dashboard', {
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
            res.render('seller/edit', {
                user: userData
            })
        } else{
            res.redirect('/seller/dashboard')
        }
        console.log(req.params.id)
    } catch (error) {
        console.log(error)
    }
}

// const UpdateUsers = async (req, res, next) => {
//     let id = req.params.id

//     try {
//         if(req.file){
//         const update = await User.findByIdAndUpdate( id , {$set: {
//             username: req.body.username,
//             firstname: req.body.firstname,
//             lastname: req.body.lastname,
//             details: req.body.details,
//             mno: req.body.mno,
//             email: req.body.email,
//             password: req.body.password,
//             image: req.file.filename
//             }})
//             res.redirect(`/seller/edit/${req.params.id}`)
//         }
//         else{
//           const update = await User.findByIdAndUpdate( id , {$set:req.body})
//           res.redirect(`/seller/edit/${req.params.id}`)
//         }
//     } catch (error) {
//         console.log(error.message)
//     }
// }

const adminProfile = async(req, res, next)=>{
    try {
        const id = req.session.user_id
        const user = await User.findOne({ _id: id })

        res.render('seller/account', { data: user })
    } catch (error) {
        console.log(error.message)
    }
}

const editAdminLoad = async(req, res, next) =>{
    try {
        let id = req.session.user_id

        const admin = await User.findById({ _id: id })

        if (admin) {
            res.render('seller/editAdmin', { user: admin })
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
            res.redirect(`/seller/edit/${req.params.id}`)
        }
        else{
          const update = await User.findByIdAndUpdate( id , {$set:req.body})
          res.redirect(`/seller/edit/${req.session.user_id}`)
        }
    } catch (error) {
        console.log(error.message)
    }
}

// const addLoad = async(req, res, next) => {
//     try {
//         res.render('seller/add')
//     } catch (error) {
//         console.log(error.message)
//     }
// }

// const addUser = async (req, res) => {
//     console.log(req.body)
//     const salt = await bcrypt.genSalt(15)
//     const hashPassword = await bcrypt.hash(req.body.password, salt)
//     const image = req.file.filename

//     try {
//         const user = new User({
//             username: req.body.username,
//             firstname: req.body.firstname,
//             lastname: req.body.lastname,
//             email: req.body.email,
//             mno: req.body.mno,
//             details: req.body.details,
//             password: hashPassword,
//             image: image,
//             is_admin:0
//         })
//               const userData = await user.save();

//               if(userData){
//                  addedSendVerifyMail(req.body.username, req.body.email, userData._id)
//                   console.log(userData)
//                   res.render('seller/add', {message: 'Registered Successfully. Please Check your mail for verification'})
//               } else{
//                   res.render('seller/add', {message: 'Registration failed.'})
//               }
//         } catch (e) {
//             console.log(e.message)
//         }
//     }

// for Purchase
const saved = async (req, res, next) => {

    try {
        const locals = {
            title: 'Registered users',
            description: 'Simple Blog'
        }

        const id = req.params.id
        const data = await User.findOne({ _id: id })
        console.log(data)
        res.render('seller/users', { locals, data })
    } catch (error) {
        console.log(error.message)
    }
}

// delete users
const deleteUser = async(req, res)=>{
    try {
        const id = req.params.id;
        await User.deleteOne({ _id: id })
        res.redirect('/seller/dashboard')

    } catch (error) {
        console.log(error.message)
    }
}





// Admin Post

const {Category} = require('../models/category');

const { request } = require('../routes/adminRoute');
const Post = require('../models/postSchema')

const loadPost = async(req, res)=> {
    try {
        const user = await User.findOne({_id: req.session.user_id})
        const categories = await Category.find()
        const data = await Post.findOne({ 'author': req.session.user_id })
        res.render('seller/add-post', {
            categories,
            data,
            user
        })
    } catch (error) {
        console.log(error)
    }
}

const insertPost = async(req, res) => {
    const image = req.file.filename

    try {
        console.log(req.body)
        console.log(image)

        const post = new Post({
            title: req.body.title,
            details: req.body.details,
            category: req.body.category,
            countInStock: req.body.countInStock,
            price: req.body.price,
            author: req.body.author,
            state: req.body.state,
            richDescription:  req.body.richDescription,
            image: image
        } )
        const postData = await post.save()

        if(postData) {
            const categories = await Category.find()
            const user = await User.findOne({_id: req.session.user_id})
            res.render('seller/add-post', {data: postData, categories, user, message: 'Post Added Successfully'})
            
        }
    } catch (error) {
        console.log(error)
    }
}

const loadHomePost = async(req, res)=> {
    try {

        const  id = req.session.user_id
        const admin = await User.findById({ _id: id })
        
        const data = await Post.find().populate({path:'category', select:['name']})

        res.render('seller/home', {
            admin,
            data
        })
        
    } catch (error) {
        console.log(error)
    }
}

const loadAllPost  = async(req, res)=> {
    try {
        const data = await Post.find({ 'author': req.session.user_id })
        // Post.find().then(function(all_posts) {
        //     res.render('admin/post', {
        //         data: all_posts,
        //         admin
        //     })
        // })
        res.render('seller/post', { data })
    } catch (error) {
        console.log(error)
    }
}
 
const viewAdded = async(req, res)=>{
    try {

        const data = await Post.findOne({ _id: req.query.id }).populate({path:'author'})
        const post_data = await Post.find({})
        const user_data = await User.find({_id: req.session.user_id })

        res.render('seller/view-added', { data, post_data, user_data })

    } catch (error) {
        console.log(error.message)
    }
}
// user_commodities
// const loadSellerHomePost = async(req, res)=> {
//     try {
//         const data = await Post.find().populate({path:'category', path:'author', select:['name']})
//         console.log('user:', req.user)
//         res.render('seller/home', {
//             data
//         })
        
//     } catch (error) {
//         console.log(error)
//     }
// }
const loadSellerCommodityPost = async(req, res)=> {
    try {
        const data = await Post.find().populate({path:'category', select:['name']})
        console.log('user:', req.user)
        res.render('admin/commodity', {
            data
        })
        
    } catch (error) {
        console.log(error.message)
    }
}
const loadSellerElectronicsPost = async(req, res)=> {
    try {
        const data = await Post.find().populate({path:'category', select:['name']})
        console.log('user:', req.user)
        res.render('admin/electronics', {
            data
        })
        
    } catch (error) {
        console.log(error.message)
    }
}
const loadSellerServicesPost = async(req, res)=> {
    try {
        const data = await Post.find().populate({path:'category', select:['name']})
        console.log('user:', req.user)
        res.render('admin/services', {
            data
        })
        
    } catch (error) {
        console.log(error.message)
    }
}
// rendering customer profile
const customerProfile = async(req, res)=>{
    try {
        res.render('seller/customer')
    } catch (error) {
        console.log(error.message)
    }
}



// information

const informationLoad = async(req, res)=>{
    try {
        const data = await User.findOne({ _id: req.session.user_id })
        res.render('seller/information', {
            data
        })
    } catch (error) {
        console.log(error)
    }
}

const insertInformation = async(req, res)=>{
    try {
        const id = req.session.user_id
        const user = await User.findOne({_id: id})
        const information = user.information

        console.log(req.body)
        const name = req.body.name
        const items = req.body.items
        const phone = req.body.phone
        const account = req.body.account
        const address = req.body.address
        const account_name = req.body.account_name

        console.log(information)
        if(information == 0){

            information.push({
                name,
                items,
                phone,
                account,
                address,
                account_name}
            )
        }
        await user.save()
        
        res.render('seller/information', {
            data: user,
            message: 'Profile Fully Updated'
        })
    } catch (error) {
        console.log(error.message)
    }
}



// category
// 
module.exports = {
    LoadRegister,
    insertAdmin,
    informationLoad,
    insertInformation,
    adminLoginLoad,
    verifyLogin,
    loadDashboard,
    adminProfile,
    loadSellerCommodityPost,
    loadSellerElectronicsPost,
    loadSellerServicesPost,
    verifyMail,
    forgetPasswordLoad,
    resetAdminPassword,
    forgetVerify,
    forgetLoad,
    edit,
    editAdminLoad,
    editAdminProfile,
    saved,
    deleteUser,
    loadPost,
    insertPost,
    loadHomePost,
    loadAllPost,
    customerProfile,
    viewAdded,
}



