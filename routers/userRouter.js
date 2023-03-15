const router = require('express').Router();
const userController = require('../controllers/userController');


router.post('/follow', userController.followUnfollowUserController);
router.get('/getFeedData', userController.getPostsOfFollowingController);
router.get('/getMyPosts', userController.getMypostsController);
router.get('/getUserPosts', userController.getUserPostController);
router.delete('/deleteMyProfile', userController.deleteMyProfileController);
router.get('/getMyProfile', userController.getMyProfileController);
router.put('/', userController.updateUserProfileController)
router.post('/getUserDetails', userController.getUserDetailsController);
router.post('/searchUser', userController.searchUserController);


module.exports = router;