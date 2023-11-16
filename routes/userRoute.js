const express = require('express');
const session = require('express-session')
const { joiErrorFormatter, mongooseErrorFormatter } = require('../controllers/validatorFter');
const MongoStore = require('connect-mongo')
const path = require('path')
const user_route = express()
const authMiddleware = require('../middlesware/authMiddleware')
const flasherMiddleware = require('../middlesware/flasherMiddleware')
const {Category} = require('../models/category')

// express
user_route.use(express.urlencoded({ extended: true }));
user_route.use(express.json());

// session
mongoDB = process.env.mongoDB

secret = process.env.secret,

user_route.use(session({
    secret: process.env.secret,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false },
    store: MongoStore.create({ mongoUrl: mongoDB }),
}))
  


// setting views
user_route.set('view engine', 'ejs')
user_route.set('views', './views')

// setting public
user_route.use("/assets", express.static("assets"));
user_route.use('/public',express.static('public'));

// body-parser

const bodyParser = require('body-parser');
user_route.use(bodyParser.json());
user_route.use(bodyParser.urlencoded({ extended: true }))


// multer for image.filename
const multer = require('multer')

const storage = multer.diskStorage({
    destination: function ( req, file, cb ) {
        cb( null, path.join(__dirname, '../public/images'));
    },
    filename: function ( req, file, cb ) {
        cb( null, Date.now() + path.extname(file.originalname) );
    }
})

// storage of image
const upload = multer({storage: storage});
// session middleware

// Getting controllers
const userController = require('../controllers/userController');
const { AsyncLocalStorage } = require('async_hooks');


// /home
user_route.get('/', userController.loadHomePost);
user_route.get('/commodity', userController.loadCommodityPost);
user_route.get('/electronics', userController.loadElectronicsPost);
user_route.get('/services', userController.loadServicesPost);


// for user_commodity

user_route.get('/user/commodity', userController.loadUserCommodityPost);
user_route.get('/user/electronics', userController.loadUserElectronicsPost);
user_route.get('/user/services', userController.loadUserServicesPost);


//  reg routes
user_route.get('/user/register', userController.loadRegister, flasherMiddleware)
user_route.post('/user/register', upload.single('image'), userController.insertUser)

// login routes
user_route.get('/user/login', userController.loadLogin)
user_route.post('/user/login', userController.verifyLogin)

//user home
user_route.get('/user/home', userController.loadHome, authMiddleware.isLogout) 

// user account
user_route.get('/user/account', authMiddleware.isLogin, userController.userProfile)

// user edit
user_route.get('/user/edit/:id', authMiddleware.isLogin, userController.editUser)

user_route.post('/user/edit', upload.single('image'), userController.updateProfile)


// email verify
user_route.get('/user/verify', userController.verifyMail)

// Forgot password
user_route.get('/user/forget', authMiddleware.isLogout, userController.forgetLoad)

user_route.post('/user/forget', userController.forgetVerify)

user_route.get('/user/forget-password', authMiddleware.isLogout, userController.forgetPasswordLoad)

user_route.post('/user/forget-password', userController.resetPassword)

// veriofcation link

user_route.get('/user/verification', userController.verificationLoad)

user_route.post('/user/verification', userController.sentVerificationLink)

// customer details
user_route.get('/user/seller', userController.sellerLoadProfile)

// getting includes page


const cartController = require('../models/userSchema')
user_route.get('/user/mycart', authMiddleware.isLogin, cartController.getCart)


user_route.post('/user/cart', authMiddleware.isLogin, cartController.addToCart)
user_route.post('/user/delete-cart', authMiddleware.isLogin, cartController.deleteInCart)
// del cart
user_route.post('/user/clear_cart/', authMiddleware.isLogin, cartController.clearCart)

// user orders
user_route.get('/user/orders', authMiddleware.isLogin, userController.orderLoad)

// user logout
//logout
user_route.get('/logout', userController.logout)
module.exports = user_route;