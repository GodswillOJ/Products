const mongoose = require('mongoose')

const Schema = mongoose.Schema;
const categorySchema = new Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
    },
    tags: {
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



const Category = mongoose.model('Category', categorySchema);


module.exports = {
  Category,
}