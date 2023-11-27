const mongoose = require('mongoose')

const Schema = mongoose.Schema;
const orderSchema = new Schema({
    orderItem:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    orderDetails: {
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
        },
      image: {
        type: String,
        }
      }]
    },
    shippingAddress1: {
        type: String,
        required: true,
    },
    shippingAddress2: {
        type: String,
        required: true,
    },
    city: {
        type: String,
        required: true,
      },
    zip: {
        type: String,
        required: true,
      },
    country: {
        type: String,
        required: true,
      },
    phone: {
        type: String,
        required: true,
      },
    status: {
      type: String,
      enum: ['pending', 'completed', 'cancelled'],
      default: 'pending',
    },
    dateOrdered: {
       type: Date,
       default: Date.now(),
      } 
});



const Order = mongoose.model('Order', orderSchema);


module.exports = {
  Order,
}