const router = require('express').Router();
const userController = require('../controllers/userController');


router.post('/follow', userController.followUnfollowUserController);
router.get('/getposts',userController.getPostsOfFollowingController);
router.get('/getMyPosts',userController.getMypostsController);
router.get('/getUserPosts',userController.getUserPostController);
router.get('/deleteMyProfile',userController.deleteMyProfileController);


module.exports = router;