const mongoose = require('mongoose')

const Schema = mongoose.Schema;
const PurchasedSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    items: {
        type: String,
    },
    phone: {
        type: String,
    },
    address: {
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
});


const Purchase = mongoose.model('Purchase', PurchasedSchema);

module.exports = Purchase