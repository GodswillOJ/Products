const mongoose = require('mongoose')

const Schema = mongoose.Schema;
const PostSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    details: {
        type: String,
        required: true
    },
    image: {
        type: String,
        default: '',
        required: true
    },
    images: [{
        type: String,
        default: ''
    }],
    price: {
        type: Number,
        default: 0
    },
    quantity: {
        type: Number,
        default: 1
    },
    author:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    category:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    richDescription:{
        type: String,
        default: ''
    },
    countInStock:{
        type: Number,
        // required: true,
        min: 0,
        max: 255
    },
    rating:{
        type: Number,
        default: 0,
    },
    numReviews: {
        type: Number,
        default: 0,
    },
    isFeatured: {
        type: Boolean,
        default: false,
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


const Post = mongoose.model('Post', PostSchema);

module.exports = Post