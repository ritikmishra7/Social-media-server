const router = require('express').Router();
const postController = require('../controllers/postController');

router.post('/', postController.createPostController);
router.post('/like', postController.likeAndUnlikePost);
router.post('/comment', postController.commentAndUncommentPost);
router.put('/', postController.updatePostController);
router.delete('/', postController.deletePostController);
router.post('/getPost', postController.getPostController);

module.exports = router;