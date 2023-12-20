const express = require('express');
const session = require('express-session')
const bcrypt = require('bcrypt')
const { joiErrorFormatter, mongooseErrorFormatter } = require('../controllers/validatorFter');
const MongoStore = require('connect-mongo')
const path = require('path')
const seller = express()
const sellerAuth = require('../middlesware/sellerAuth')
const flasherMiddleware = require('../middlesware/flasherMiddleware')
const adminController = require('../controllers/sellerController')





// express
seller.use(express.urlencoded({ extended: true }));
seller.use(express.json());

mongoDB = process.env.mongoDB

secret = process.env.secret,

seller.use(session({
    secret: process.env.secret,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false },
    store: MongoStore.create({ mongoUrl: mongoDB }),
}))
  

// setting views
seller.set('view engine', 'ejs')
seller.set('views', './views')

// setting public
seller.use("/assets", express.static("assets"));
seller.use('/public',express.static('public'));

// body-parser

const bodyParser = require('body-parser');
seller.use(bodyParser.json());
seller.use(bodyParser.urlencoded({ extended: true }))

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

//  admin root and login

// admin registration
seller.get('/seller/registration', adminController.LoadRegister)

seller.post('/seller/registration', upload.single('image'), adminController.insertAdmin)

// admin login

seller.get('/seller/login', adminController.adminLoginLoad)

seller.post('/seller/login', adminController.verifyLogin)

// admin home
seller.get('/seller/home', sellerAuth.isAdminLogin, adminController.loadHomePost)

//  email verify

seller.get('/seller/verify', adminController.verifyMail)

// load dashboard

seller.get('/seller/dashboard', sellerAuth.isAdminLogin, adminController.loadDashboard)

// // admin/edit
// seller.get('/seller/edit/:id', adminAuth.isAdminLogin, adminController.edit)

// // User edit
// seller.post('/seller/edit/:id', upload.single('image'), adminController.UpdateUsers)

// Admin account
seller.get('/seller/profile', sellerAuth.isAdminLogin, adminController.adminProfile)

// Admin profile edit
seller.get('/seller/edit-admin/:id', sellerAuth.isAdminLogin, adminController.editAdminLoad)
seller.post('/seller/edit-admin/:id', sellerAuth.isAdminLogin, upload.single('image'), adminController.editAdminProfile)

// // add users
// seller.get('/seller/add', adminAuth.isLogin, adminController.addLoad)

// add post
//  seller.post('/seller/add', adminAuth.isLogin, upload.single('image'), adminController.sellerAuth

 // Admin user 
seller.get('/seller/view/:id', sellerAuth.isAdminLogin, adminController.saved)

// delete user
seller.get('/seller/delete-user/:id', sellerAuth.isAdminLogin, adminController.deleteUser)

 // email password verify

// Forgot password
seller.get('/seller/forget', sellerAuth.isAdminLogout, adminController.forgetLoad)
seller.post('/seller/forget', adminController.forgetVerify)
seller.get('/seller/forget-password', sellerAuth.isAdminLogout, adminController.forgetPasswordLoad)
seller.post('/seller/forget-password', adminController.resetAdminPassword)



// categories
// for user_commodity
seller.get('/seller/commodity', adminController.loadSellerCommodityPost);
seller.get('/seller/electronics', adminController.loadSellerElectronicsPost);
seller.get('/seller/services', adminController.loadSellerServicesPost);




// admin Post
seller.get('/seller/post', sellerAuth.isAdminLogin, adminController.loadPost)
seller.post('/seller/post', upload.single('image'), adminController.insertPost)

seller.get('/seller/all-post/', sellerAuth.isAdminLogin, adminController.loadAllPost)
seller.post('/seller/remove-post', sellerAuth.isAdminLogin, adminController.removePost)
seller.post('/seller/delete-post/', sellerAuth.isAdminLogin, adminController.deletePost)

seller.get('/all-post/view-added/', adminController.viewAdded)

// customer details
seller.get('/seller/customer', adminController.customerProfile)

// information setup
seller.get('/seller/information', adminController.informationLoad)
seller.post('/seller/information', adminController.insertInformation)

seller.get('/seller/order_id/:id', sellerAuth.isAdminLogin, adminController.viewOrderInfo)


module.exports = seller;