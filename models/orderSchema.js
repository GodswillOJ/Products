const mongoose = require('mongoose')

const Schema = mongoose.Schema;
const orderSchema = new Schema({
    orderItem:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    }],
    shippingAddress1: {
        type: String,
        required: true,
    },
    shippingAddress1: {
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
        required: true,
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