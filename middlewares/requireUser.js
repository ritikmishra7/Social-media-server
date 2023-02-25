const jwt = require('jsonwebtoken');
const {success, error } = require('../utils/responseWrapper'); 
module.exports = async (req, res, next) => {

    if (!req.headers?.authorization?.startsWith("Bearer"))
        return res.send(error(401,'Authorization is required'));

    const accessToken = req.headers.authorization.split(" ")[1];

    try {
        const verifiedToken = jwt.verify(accessToken, process.env.ACCESS_TOKEN_PRIVATE_KEY);
        req._id = verifiedToken._id;
        next();
    } catch (e) {
        console.log(e);
        return res.send(error(401,'Invalid access key'));
    }

}