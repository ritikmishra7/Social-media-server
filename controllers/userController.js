const User = require("../models/userModel");
const Post = require("../models/postModel");
const { success, error } = require("../utils/responseWrapper");

const followUnfollowUserController = async (req,res) => {

    try {
        const {userIdToFollow} =  req.body;
        
        if(!userIdToFollow)
        return res.send(error(404,'UserId is required'));

        const currUserId = req._id;
    
        const currUser = await User.findById(currUserId);
    
        const userToFollow = await User.findById(userIdToFollow);
    
        if(!userToFollow) { // user to follow doesn't exist
            return res.send(success(404, 'User not found'));
        }

        if(currUserId === userIdToFollow)
        return res.send(error(409,'User cannot follow himself'))
    
        if(currUser.followings.includes(userIdToFollow)) { // already followed so now unfollow
                const followingIndex = currUser.followings.indexOf(userIdToFollow);
                currUser.followings.splice(followingIndex,1);
    
                const followerIndex = userToFollow.followers.indexOf(currUser);
                userToFollow.followers.splice(followerIndex,1);
    
                await userToFollow.save();
                await currUser.save();
    
                return res.send(success(200,'User Unfollowed'));
        }
        else
        {
            userToFollow.followers.push(currUserId);
            currUser.followings.push(userIdToFollow);

            await userToFollow.save();
            await currUser.save();

            return res.send(success(200,'User Followed'));
        }
    } catch (e) {
            return res.send(error(500,e.message)); 
    }
   
}


const getPostsOfFollowingController = async (req,res) => {
        try {
    const currUserId = req._id;
    const currUser = await User.findById(currUserId);

    const posts = await Post.find({
        'owner' : {
            '$in' : currUser.followings
        }
    }).populate('likes');
    return res.send(success(200, posts))
        } catch (e) {
            return res.send(error(500,e.message)); 
        }
    
}

const getMypostsController = async (req, res) => {

    try {
    const currUserId = req._id;
    const myPosts = await Post.find({'owner' : currUserId}).populate('likes');
    return res.send(success(200,myPosts));
    } catch (e) {
        return res.send(error(500,e.message));
    }
}

const getUserPostController = async (req,res) => {
    try {
        const {userId} = req.body;
        if(!userId)
        return res.send(error(400,'UserId is required'));

        const userPosts = await Post.find({'owner' : userId}).populate('likes');
        return res.send(success(200,userPosts));
    } catch (e) {
        return res.send(error(500,e.message));
    }
}


const deleteMyProfileController = async (req,res) => {
    try {
        const currUserId = req._id;
        // await User.findByIdAndDelete(currUserId);
        // await Post.deleteMany({'owner': currUserId});
        const currUser = await User.findById(currUserId);
        return res.send(success(200,User));
    } catch (e) {
        return res.send(error(500,e.message));
    }
}


module.exports = {followUnfollowUserController, //FollowUnfollowUsers
                 getPostsOfFollowingController, //getPostsOfFollowings
                 getMypostsController, //getMyposts
                 getUserPostController,  //getUserPosts
                 deleteMyProfileController  //deleteMyProfile
                }