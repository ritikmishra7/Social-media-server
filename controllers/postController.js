const { success, error } = require("../utils/responseWrapper");
const Posts = require("../models/postModel");
const User = require("../models/userModel");

const createPostController = async (req, res) => {
    try {
        const { caption } = req.body;
        const owner = req._id;

        const user = await User.findById(owner);
        const post = await Posts.create({
            owner,
            caption,
        });

        user.posts.push(post._id);
        await user.save();

        return res.send(success(201, post));
    } catch (e) {
        return res.send(error(500, e.message));
    }
};

const likeAndUnlikePost = async (req, res) => {
    try {
        const { postId } = req.body;
        const currUserId = req._id;
        const post = await Posts.findById(postId);
        if (!post) {
            return res.send(error(404, "Post not found"));
        }

        if (post.likes.includes(currUserId)) {
            const index = post.likes.indexOf(currUserId);

            post.likes.splice(index, 1);
            await post.save();

            return res.send(success(200, "Post Unliked"));
        } else {
            post.likes.push(currUserId);
            await post.save();
            return res.send(success(200, "Post Liked"));
        }
    } catch (e) {
        return res.send(error(500, e.message));
    }
};

const commentAndUncommentPost = async (req, res) => {
    try {
        const { postId, caption } = req.body;
        const currUserId = req._id;

        const post = await Posts.findById(postId);
        if (!post) {
            return res.send(error(404, "Post not found"));
        }

        // const result =   await Posts.aggregate([{$unwind: "$comment"}, {$match:{"comment.commentOwner" : currUserId}}] )
        // console.log("This is result",result);

        const result = findComment(post.comment, currUserId);

        return res.send(success(404, result));

        // if(post.comment.find( o => o.commentOwner === currUserId))
        // {
        //     const index = post.comment.findIndex( o => o.commentOwner === currUserId);

        //     post.likes.splice(index,1);
        //     await post.save();

        //     return res.send(success(200, 'Post Uncommented'));
        // }
        // else
        // {
        //     post.comment.push({
        //         caption,
        //         commentOwner: currUserId
        //     });
        //     await post.save();

        //     return res.send(success(200,{caption}));
        // }
    } catch (e) {
        console.log(e);
        return res.send(error(500, e.message));
    }
};

const updatePostController = async (req, res) => {
    try {
        const { postId, caption } = req.body;
        const currUserId = req._id;

        const postToUpdate = await Posts.findById(postId);
        if (!postToUpdate) return res.send(error(404, "Post not found"));

        if (postToUpdate.owner.toString() !== currUserId) {
            return res.send(error(403, "Only owners can update their posts"));
        }

        if (caption) {
            postToUpdate.caption = caption;
        }

        await postToUpdate.save();
        return res.send(success(200, "Post Updated"));
    } catch (e) {
        return res.send(error(500, e.message));
    }
};

const deletePostController = async (req, res) => {

    try {
    const { postId } = req.body;
    const currUserId = req._id;

    const postToDelete = await Posts.findById(postId);
    const currUser = await User.findById(currUserId);
    if (!postToDelete) 
        return res.send(error(404, "Post not found"));

    if (postToDelete.owner.toString() !== currUserId)
        return res.send(error(403, "Only owners can delete their posts"));

    const index = currUser.posts.indexOf(postId);
    currUser.posts.splice(index,1);
    await currUser.save();
    await postToDelete.remove();
    
    return res.send(success(200, 'Post Deleted successfully'));
    } catch (e) {
        return res.send(error(500,e.message));
    }
    
};

module.exports = {
    createPostController,
    likeAndUnlikePost,
    commentAndUncommentPost,
    updatePostController,
    deletePostController
};
