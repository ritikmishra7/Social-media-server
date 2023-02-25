const router = require('express').Router();
const requireUser = require('../middlewares/requireUser');
const authRouter = require('./authRouter');
const postRouter = require('./postRouter');
const userRouter = require('./userRouter');


router.use('/auth', authRouter);
router.use('/posts', requireUser, postRouter);
router.use('/user', requireUser, userRouter);

module.exports = router;
