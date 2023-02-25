const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    name: {
        type: String,
        required: true
    },
    username: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    avatar: {
        publicId: String,
        url: String
    },
    followers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    }],  
    followings: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    }],
    posts: [
        {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'post'
        }
    ]
});

module.exports = mongoose.model("user", userSchema);