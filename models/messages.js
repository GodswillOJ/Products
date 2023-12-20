const mongoose = require('mongoose')

const Schema = mongoose.Schema;

const messageSchema = new Schema({
    sender: String,
    receiver: String,
    title: String,
    content: String,
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' }, // Reference to the Admin model
    isRead: { type: Boolean, default: false },
    timestamp: { type: Date, default: Date.now }
  });
  
const Messages = mongoose.model('Messages', messageSchema);


module.exports = Messages