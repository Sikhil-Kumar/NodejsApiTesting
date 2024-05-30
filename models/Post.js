const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const postSchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
  content: { 
    type: String,
    //  required: true 
    },
  likes: { 
    type: Number,
     default: 0 
    },
  comments: [
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user',
          },
      text: String,
      createdAt: { type: Date, default: Date.now }
    }
  ],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Post', postSchema);
