const router = require('express').Router();
const requireUser = require('../middlewares/requireUser');
const authRouter = require('./authRouter');
const postRouter = require('./postRouter');

router.use('/auth', authRouter);
router.use('/posts', requireUser, postRouter);

module.exports = router;
