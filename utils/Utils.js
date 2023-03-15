const ago = require('s-ago');
const mapPostOutput = (post, userId) => {
    return {
        _id: post._id,
        caption: post.caption,
        image: post.image,
        owner: {
            _id: post.owner._id,
            name: post.owner.name,
            username: post.owner.username,
            avatar: post.owner.avatar
        },
        likesCount: post.likes.length,
        isLiked: post.likes.includes(userId),
        commentsCount: post.comment.length,
        comments: post.comment.map(comment => {
            return {
                _id: comment._id,
                caption: comment.caption,
                commentOwner: {
                    _id: comment.commentOwner._id,
                    name: comment.commentOwner.name,
                    username: comment.commentOwner.username,
                    avatar: comment.commentOwner.avatar
                },
                timeAgo: ago(comment._id.getTimestamp()),
            }
        }),
        timeAgo: ago(post.createdAt)
    }
}

module.exports = { mapPostOutput }
