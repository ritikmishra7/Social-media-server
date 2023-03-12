const User = require("../models/userModel");
const Post = require("../models/postModel");
const { success, error } = require("../utils/responseWrapper");
const { mapPostOutput } = require("../utils/Utils");
const cloudinary = require('cloudinary').v2;


const followUnfollowUserController = async (req, res) => {

    try {
        const { userIdToFollow } = req.body;

        if (!userIdToFollow)
            return res.send(error(404, 'UserId is required'));

        const currUserId = req._id;

        const currUser = await User.findById(currUserId);

        const userToFollow = await User.findById(userIdToFollow);

        if (!userToFollow) { // user to follow doesn't exist
            return res.send(success(404, 'User not found'));
        }

        if (currUserId === userIdToFollow)
            return res.send(error(409, 'User cannot follow himself'))

        if (currUser.followings.includes(userIdToFollow)) { // already followed so now unfollow
            const followingIndex = currUser.followings.indexOf(userIdToFollow);
            currUser.followings.splice(followingIndex, 1);

            const followerIndex = userToFollow.followers.indexOf(currUser);
            userToFollow.followers.splice(followerIndex, 1);

            await userToFollow.save();
            await currUser.save();

            return res.send(success(200, { followers: userToFollow.followers, isFollowing: false, userIdfollowed: userIdToFollow }));
        }
        else {
            userToFollow.followers.push(currUserId);
            currUser.followings.push(userIdToFollow);

            await userToFollow.save();
            await currUser.save();

            return res.send(success(200, { followers: userToFollow.followers, isFollowing: true, userIdfollowed: userIdToFollow }));
        }
    } catch (e) {
        return res.send(error(500, e.message));
    }

}


const getPostsOfFollowingController = async (req, res) => {
    try {
        const currUserId = req._id;
        const currUser = await User.findById(currUserId);

        const fullPosts = await Post.find({
            'owner': {
                '$in': currUser.followings
            }
        }).populate('owner');
        const posts = fullPosts.map((post) => mapPostOutput(post, req._id)).reverse();
        currUser.posts = posts;
        const followingsId = currUser.followings.map((user) => { return user._id });
        const Suggestions = await User.find({
            _id: {
                '$nin': followingsId
            },
        }).limit(3);
        const newSuggestions = Suggestions.filter((suggestion) => { return suggestion._id.toString() !== currUserId });

        return res.send(success(200, { ...currUser._doc, Suggestions: newSuggestions, posts }));
    } catch (e) {
        return res.send(error(500, e.message));
    }

}

const getMypostsController = async (req, res) => {

    try {
        const currUserId = req._id;
        const myPosts = await Post.find({ 'owner': currUserId }).populate('likes');
        return res.send(success(200, myPosts));
    } catch (e) {
        return res.send(error(500, e.message));
    }
}

const getUserPostController = async (req, res) => {
    try {
        const { userId } = req.body;
        if (!userId)
            return res.send(error(400, 'UserId is required'));

        const userPosts = await Post.find({ 'owner': userId }).populate('likes');
        return res.send(success(200, userPosts));
    } catch (e) {
        return res.send(error(500, e.message));
    }
}


const deleteMyProfileController = async (req, res) => {
    try {
        const currUserId = req._id;
        const currUser = await User.findById(currUserId);

        //delete all posts
        await Post.deleteMany({
            owner: currUserId
        })

        //delete this user from following of every user
        console.log(currUser);
        currUser?.followers?.forEach(async (followerId) => {
            const follower = await User.findById(followerId);
            const index = follower.followings.indexOf(currUserId);

            if (index !== -1) {
                follower.followings.splice(index, 1);
                await follower.save();
            }
        })

        //delete this user from followings of every user
        currUser?.followings?.forEach(async (followingId) => {
            const following = await User.findById(followingId);
            const index = following.followers?.indexOf(currUserId);
            if (index !== -1) {
                following.followers.splice(index, 1);
                await following.save();
            }
        })


        //remove this user from likes of every posts
        const allPosts = await Post.find();
        allPosts.forEach(async (post) => {
            const index = post.likes.indexOf(currUserId);
            if (index !== -1) {
                post.likes.splice(index, 1);
                await post.save();
            }
        })

        //finally delete this user
        await currUser.remove();

        //Clear the jwt cookie i.e. refreshToken and accessToken is to be cleared by Front-end from localStorage
        res.clearCookie('jwt', {
            httpOnly: true,
            secure: true
        });

        return res.send(success(200, "User deleted Successfully"));
    } catch (e) {
        // console.log(e);
        return res.send(error(500, e.message));
    }
}

const getMyProfileController = async (req, res) => {
    try {
        const user = await User.findById(req._id).populate('followers').populate('followings').populate(
            {
                path: 'posts',
                populate: {
                    path: 'owner',
                }
            }
        );
        const fullPosts = user.posts;
        const posts = fullPosts.map((post) => mapPostOutput(post, req._id)).reverse();
        return res.send(success(200, { ...user._doc, posts }));
    } catch (e) {
        return res.send(error(500, e.message));
    }
}

const updateUserProfileController = async (req, res) => {
    try {

        const { name, username, email, bio, avatar } = req.body;
        const user = await User.findById(req._id).populate('posts').populate('followers').populate('followings');

        if (name && user?.name !== name) {
            user.name = name;
        }

        if (username && user?.username !== username) {
            const isAvailable = await User.find({ username });
            if (isAvailable.length)
                return res.send(error(409, "Username already exists"));

            user.username = username;
        }

        if (email && user?.email !== email) {
            const isAvailable = await User.find({ email });
            if (isAvailable.length)
                return res.send(error(409, "Email already exist"));
            user.email = email;
        }

        if (bio) {
            user.bio = bio;
        }

        if (avatar) {

            if (!user.avatar || (user.avatar && user.avatar !== avatar)) {
                const cloudImg = await cloudinary.uploader.upload(avatar, {
                    folder: 'profileImg',
                });


                user.avatar = {
                    url: cloudImg.secure_url,
                    publicId: cloudImg.public_id
                }
            }
        }
        await user.save();

        const fullPosts = user.posts;
        const mappedPosts = fullPosts.map((post) => mapPostOutput(post, req._id)).reverse();
        return res.send(success(202, { ...user._doc, posts: mappedPosts }));
    } catch (e) {
        return res.send(error(500, e.message));
    }
}

const getUserDetailsController = async (req, res) => {
    try {
        const { userId } = req.body;
        const user = await User.findById(userId).populate('followers').populate('followings').populate(
            {
                path: 'posts',
                populate: {
                    path: 'owner',
                }
            }
        )

        const fullPosts = user.posts;
        const posts = fullPosts.map((post) => mapPostOutput(post, req._id)).reverse();
        const isFollowing = user.followers.some((follower) => follower._id.toString() === req._id);
        return res.send(success(200, { ...user._doc, posts, isFollowing }));
    } catch (e) {
        return res.send(error(500, e.message));
    }
}

module.exports = {
    followUnfollowUserController, //FollowUnfollowUsers
    getPostsOfFollowingController, //getPostsOfFollowings
    getMypostsController, //getMyposts
    getUserPostController,  //getUserPosts
    deleteMyProfileController,  //deleteMyProfile
    getMyProfileController,     // get all neceassay information with populate
    updateUserProfileController, // update profile
    getUserDetailsController, // get user details
}