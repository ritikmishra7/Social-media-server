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
    bio: {
        type: String,
    },
    username: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String,
        required: true,
        select: false
    },
    avatar: {
        publicId: String,
        url: String
    },
    followers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        unique: true
    }],
    followings: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        unique: true
    }],
    posts: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'post'
        }
    ]
}, {
    timestamps: true
});

module.exports = mongoose.model("user", userSchema);