const express = require('express');
const session = require('express-session')
const bcrypt = require('bcrypt')
const { joiErrorFormatter, mongooseErrorFormatter } = require('../controllers/validatorFter');
const MongoStore = require('connect-mongo')
const path = require('path')
const admin_route = express()
const adminAuth = require('../middlesware/authMiddleware')
const flasherMiddleware = require('../middlesware/flasherMiddleware')
const adminController = require('../controllers/adminController')





// express
admin_route.use(express.urlencoded({ extended: true }));
admin_route.use(express.json());

mongoDB = process.env.mongoDB

secret = process.env.secret,

admin_route.use(session({
    secret: process.env.secret,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false },
    store: MongoStore.create({ mongoUrl: mongoDB }),
}))
  

// setting views
admin_route.set('view engine', 'ejs')
admin_route.set('views', './views')

// setting public
admin_route.use("/assets", express.static("assets"));
admin_route.use('/public',express.static('public'));

// body-parser

const bodyParser = require('body-parser');
admin_route.use(bodyParser.json());
admin_route.use(bodyParser.urlencoded({ extended: true }))

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
admin_route.get('/admin/registration', adminController.LoadRegister)

admin_route.post('/admin/registration', upload.single('image'), adminController.insertAdmin)

// admin login

admin_route.get('/admin/login', adminController.adminLoginLoad)

admin_route.post('/admin/login', adminController.verifyLogin)

// admin home
admin_route.get('/admin/home', adminAuth.isAdminLogin, adminController.loadHomePost, adminController.LoadHome)

//  email verify

admin_route.get('/admin/verify', adminController.verifyMail)

// load dashboard

admin_route.get('/admin/dashboard', adminAuth.isAdminLogin, adminController.loadDashboard)

// admin/edit
admin_route.get('/admin/edit/:id', adminAuth.isAdminLogin, adminController.edit)

// User edit
admin_route.post('/admin/edit/:id', upload.single('image'), adminController.UpdateUsers)

// Admin account
admin_route.get('/admin/profile', adminAuth.isAdminLogin, adminController.adminProfile)

// Admin profile edit
admin_route.get('/admin/edit-admin/:id', adminAuth.isAdminLogin, adminController.editAdminLoad)
admin_route.post('/admin/edit-admin/:id', adminAuth.isAdminLogin, upload.single('image'), adminController.editAdminProfile)

// add users
admin_route.get('/admin/add', adminAuth.isAdminLogin, adminController.addLoad)

// add post
 admin_route.post('/admin/add', adminAuth.isAdminLogin, upload.single('image'), adminController.addUser)


 // Admin user 
admin_route.get('/admin/view/:id', adminAuth.isAdminLogin, adminController.saved)

// delete user
admin_route.get('/admin/delete-user/:id', adminAuth.isAdminLogin, adminController.deleteUser)

 // email password verify

// Forgot password
admin_route.get('/admin/forget', adminAuth.isAdminLogin, adminController.forgetLoad)
admin_route.post('/admin/forget', adminController.forgetVerify)
admin_route.get('/admin/forget-password', adminAuth.isAdminLogout, adminController.forgetPasswordLoad)
admin_route.post('/admin/forget-password', adminController.resetAdminPassword)



// categories
admin_route.get('/admin/edit-category', adminAuth.isAdminLogin, adminController.loadCategory)
admin_route.post('/admin/edit-category', adminAuth.isAdminLogin, adminController.postCategory)




// admin Post
admin_route.get('/admin/post', adminAuth.isAdminLogin, adminController.loadPost)
admin_route.post('/admin/post', upload.single('image'), adminController.insertPost)

admin_route.get('/admin/all-post/', adminAuth.isAdminLogin, adminController.loadAllPost)

admin_route.get('/all-post/view-added/', adminController.viewAdded)


// for user_commodity
admin_route.get('/admin/home', adminController.loadAdminHomePost);
admin_route.get('/admin/commodity', adminController.loadAdminCommodityPost);
admin_route.get('/admin/electronics', adminController.loadAdminElectronicsPost);
admin_route.get('/admin/services', adminController.loadAdminServicesPost);

module.exports = admin_route;