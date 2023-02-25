const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {success, error } = require('../utils/responseWrapper'); 

const signupController = async (req, res) => {
    try {

        const { email, name, username, password, cpassword } = req.body;

        if (!email && !name && !username && !password && !cpassword)
            // return res.send('All fields are required');
            return res.send(error(400,'All fields are required'));
        else if (!email)
            return res.send(error(400,'Email is required'));
        else if (!name)
            return res.send(error(400,'Name is required'));
        else if (!username)
            return res.send(error(400,'Username is required'));
        else if (!password)
            return res.send(error(400,'Password is required'));
        else if (!cpassword)
            return res.send(error(400,'Confirm Password is required'));
        else if (password !== cpassword)
            return res.send(error(409,'Both the passwords should match'));
        else {

            const oldUser1 = await User.findOne({ email });
            const oldUser2 = await User.findOne({ username });
            if (oldUser1 || oldUser2)
                return res.send(error(409,'User is already registered'));

            const hashedPassword = await bcrypt.hash(password, 10);
            const user = await User.create({
                email,
                name,
                username,
                password: hashedPassword
            });

            // return res.status(201).send({
            //     user
            // });
            return res.send(success(201,user));
        }
    } catch (e) {
        console.log(e);
    }
}


const loginController = async (req, res) => {
    try {
        const { email_username, password } = req.body;

        if (!email_username && !password)
            return res.send(error(400,'All fields are required'));
        else if (!email_username)
            return res.send(error(400,'Email or Username is required'));
        else if (!password)
            return res.send(error(400,'Password is required'));
        else {
            const oldUser1 = await User.findOne({ email: email_username });
            const oldUser2 = await User.findOne({ username: email_username });
            if (!oldUser1 && !oldUser2)
                return res.send(error(409,'User is not registered'));

            let matched;
            if (oldUser1 && !oldUser2) {
                matched = await bcrypt.compare(password, oldUser1.password);
            }
            else if (oldUser2 && !oldUser1) {
                matched = await bcrypt.compare(password, oldUser2.password);
            }

            if (!matched)
                return res.send(error(403,'Incorrect Password'));

            if (oldUser1 && !oldUser2) {
                // return res.json(oldUser1);
                const accessToken = generateAccessTokens(oldUser1);
                const refreshToken = generateRefreshTokens(oldUser1);

                res.cookie('jwt', refreshToken, {
                    httpOnly: true,
                    secure: true
                })
                return res.send(success(201,{accessToken}));
            }
            else if (oldUser2 && !oldUser1) {
                // return res.json(oldUser2);
                const accessToken = generateAccessTokens(oldUser2);
                const refreshToken = generateRefreshTokens(oldUser2);
                res.cookie('jwt', refreshToken, {
                    httpOnly: true,
                    secure: true
                })
                return res.send(success(201,{accessToken}));
            }
        }
    } catch (e) {
        console.log(e);
        return res.send(error(404,"Technical Error"))
    }
}

const logoutController = async (req,res) => {
                try {
                    res.clearCookie('jwt', {
                        httpOnly: true,
                        secure: true
                    });

                    return res.send(success(200, 'user logged out'));

                } catch (e) {
                    return res.send(error(500, e.message))
                }
}

//This api will refresh or generate a new access token if refresh token is still valid
const refreshAccessToken = async (req,res) => {

    const cookies = req.cookies;
    if(!cookies.jwt) {
        return res.send(error(401,'Refresh Token is required'));
    }

    const refreshToken = cookies.jwt;

    try {
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_PRIVATE_KEY);

        const data = {
            '_id' : decoded._id,
            'email' : decoded.email,
            'username' : decoded.username
        };
        const accessToken = generateAccessTokens(data);
            return res.send(success(201,{accessToken}));
    } catch (e) {
        console.log(e);
        return res.send(error(401,'Invalid refresh token'));
    }

};


//Internal Functions
function generateAccessTokens(data) {
    try {
        const accessToken = jwt.sign({ '_id': data._id, 'email': data.email, 'username': data.username }, process.env.ACCESS_TOKEN_PRIVATE_KEY, {
            expiresIn: '1d'
        });
        return accessToken;
    } catch (e) {
        console.log(e);
    }
}

function generateRefreshTokens(data) {
    try {
        const accessToken = jwt.sign({ '_id': data._id, 'email': data.email, 'username': data.username }, process.env.REFRESH_TOKEN_PRIVATE_KEY, {
            expiresIn: '1y'
        });
        return accessToken;
    } catch (e) {
        console.log(e);
    }
}

module.exports = { signupController, loginController, refreshAccessToken, logoutController };