const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config()
const joi = require('joi')


const userSchema = mongoose.Schema({
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    mno: { type: String, required: true },
    username: { type: String, required: true },
    email: {type: String,
        trim: true,
        lowercase: true,
        unique: true,
        required: 'Email address is required',
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']},
    information: [{
        name: {
            type: String,
        },
        items: {
            type: String,
        },
        phone: {
            type: String,
        },
        account: {
            type: String
        },
        address: {
            type: String,
        },
        account_name: {
            type: String,
        },
        createdAt: {
            type: Date,
            required: true,
            default: Date.now(),
          },
        created: {
            type: String,
            default: Date,
            required: true
          },
        updatedAt: {
          type: Date,
          required: true,
          default: Date.now(),
          } 
    }],
    post:{
      posts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
        // required: true
      }]
    },
    cart: {
      totalPrice: {type: Number, default: 0},
      items: [{
        name: {
        type: String,
        required: true
        },
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
        required: true
        },
      quantity: {
        type: Number,
        required: true
        },
      price: {
        type: Number,
        }
      }]
    },
    password: { type: String, min: 3, required: true },
    details: { type: String, required: true},
    image: { type: String, required: true},
    state: { type: String },
    created: {
      type: Date,
      required: true,
      default: Date.now(),
    }, 
    updatedAt: {
      type: Date, 
      default: Date.now(),
    }, 
    is_admin: {
      type: Number,
      required: true
    },
    is_verified: {
      type: Number,
      default: 0
    },
    token: {
      type: String,
      default: ''
    }
  })







// Post 


// Cart setup
  const addToCart = async(req, res, next)=>{
    
    try {
        const product = req.body;
        const price = req.body.price
        const name = req.body.name

        let owner = await User.findOne({_id: req.session.user_id}).exec()
        const cart = owner.cart
        console.log(cart)

        const title = product.title;
        const quantity = product.quantity;
        const image = product.image;
        const totalPrice = product.price;
        

        if (cart) {
            const itemIndex = cart.items.findIndex((p) => p.productId.toString() === product.productId);
            console.log(itemIndex)
            
            if (itemIndex > -1) {
                cart.totalPrice = cart.totalPrice + parseInt(req.body.price),
                // Update an existing product in the products array
                cart.items[itemIndex].quantity += 1;
                cart.items[itemIndex].price = cart.items[itemIndex].quantity * price;
            } else {
                // Add a new product to the products array
                cart.items.push(
                    {   
                            productId: product.productId,
                            title,
                            quantity,
                            price,
                            name,
                            image
                    
                    });
                cart.totalPrice += parseInt(product.price)

                    // Update the cart document in the database
            }
            await owner.save()


        } else {
            // Create a new cart document with the product
            if(cart.items.length == 0) {
              cart.items.push(
                {               
                  productId: product.productId,
                  title,
                  quantity,
                  price,
                  name,
                  image
          
                 });
              cart.totalPrice = req.body.price
          }

            await owner.save()
        } 
        res.redirect(`/user/home`)
            
} catch (error) {
        console.log(error)
    }

}

const getCart = async(req, res)=> {
  try {
      const owner = await User.findById({_id: req.session.user_id})
      const cart = owner.cart
      res.render('users/mycart', {
        cart
      })
  } catch (error) {
      console.log(error.message)
  }
}

const deleteInCart = async (req, res, next) => {

  try {
      console.log(req.body)

      const userId = req.session.user_id; 
      const productId = req.body.productId;
      const quantity = req.body.quantity
      const price = req.body.price
      
      let owner = await User.findOne({ _id: userId }).exec();
      
      console.log(owner.cart)
      const cart = owner.cart
      //Cart exist for user
      if(cart === null) {
          const cart = { items: [], totalPrice: 0}
      }
      if(cart) {
          // const itemIndex = cart.items.findIndex((p) => p.productId.toString() === productId);
          const itemIndex = cart.items.findIndex((p) => p.id === productId)
          console.log(itemIndex)
      
          if (itemIndex >= -1) {
              // Update an existing product in the products array
              if (cart.items.length > 0) {

                  cart.items.splice(itemIndex, 1)             
                  console.log(cart.items)
                  cart.totalPrice = cart.totalPrice - price  
              }
             await owner.save()
          }
      } else { // no Cart for the user, exit
          res.send('Nothing happened')
      }
      res.render('users/mycart', {
        cart
      })
  } catch(err) {
      console.log(err);

  }
};
// delete users
const clearCart = async(req, res, next)=>{
  try {
    console.log(req.body)
    const owner = await User.findOne({_id: req.session.user_id})
    const cart = owner.cart
    const productId = req.body.productId
    if(cart) {
      // const itemIndex = cart.items.findIndex((p) => p.productId.toString() === productId);
      const itemIndex = cart.items.findIndex((p) => p.id === productId)
      console.log(itemIndex)
  
      if (itemIndex >= -1) {
          // Update an existing product in the products array
          if (cart.items.length >= 0) {

              cart.items.splice(0)            
              console.log(cart.items)
              cart.totalPrice = cart.totalPrice * 0 
          }
         await owner.save()
      }
  } else { // no Cart for the user, exit
      res.send('Nothing happened')
  }
      res.render('users/mycart', {
        cart
      })

  } catch (error) {
      console.log(error)
  }
}






const User = mongoose.model('User', userSchema);

  module.exports = {
    User,
    getCart,
    deleteInCart,
    addToCart,
    clearCart
    // validateClient,
    // validateClientLogin,
  }
