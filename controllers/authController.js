const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const signupController = async (req, res) => {
    try {

        const { email, name, username, password, cpassword } = req.body;

        if (!email && !name && !username && !password && !cpassword)
            return res.send('All fields are required');
        else if (!email)
            return res.send('Email is required');
        else if (!name)
            return res.send('Name is required');
        else if (!username)
            return res.send('Username is required');
        else if (!password)
            return res.send('Password is required');
        else if (!cpassword)
            return res.send('Confirm Password is required');
        else if (password !== cpassword)
            return res.send('Both the passwords should match');
        else {

            const oldUser1 = await User.findOne({ email });
            const oldUser2 = await User.findOne({ username });
            if (oldUser1 || oldUser2)
                return res.status(409).send("User is already registered");

            const hashedPassword = await bcrypt.hash(password, 10);
            const user = await User.create({
                email,
                name,
                username,
                password: hashedPassword
            });

            return res.status(201).send({
                user
            });
        }
    } catch (error) {
        console.log(error);
    }
}


const loginController = async (req, res) => {
    try {
        const { email_username, password } = req.body;

        if (!email_username && !password)
            return res.send('All fields are required');
        else if (!email_username)
            return res.send('Email or Username is required');
        else if (!password)
            return res.send('Password is required');
        else {
            const oldUser1 = await User.findOne({ email: email_username });
            const oldUser2 = await User.findOne({ username: email_username });
            if (!oldUser1 && !oldUser2)
                return res.status(409).send("User is not registered");

            let matched;
            if (oldUser1 && !oldUser2) {
                matched = await bcrypt.compare(password, oldUser1.password);
            }
            else if (oldUser2 && !oldUser1) {
                matched = await bcrypt.compare(password, oldUser2.password);
            }

            if (!matched)
                return res.status(403).send("Incorrect password");

            if (oldUser1 && !oldUser2) {
                // return res.json(oldUser1);
                const accessToken = generateAccessTokens(oldUser1);
                return res.status(201).send({ accessToken });
            }
            else if (oldUser2 && !oldUser1) {
                // return res.json(oldUser2);
                const accessToken = generateAccessTokens(oldUser2);
                return res.status(201).send({ accessToken });
            }

        }
    } catch (error) {
        console.log(error);
    }
}

//Internal Functions

function generateAccessTokens(data) {
    const accessToken = jwt.sign({ '_id': data._id, 'email': data.email, 'username': data.username }, process.env.ACCESS_TOKEN_PRIVATE_KEY, {
        expiresIn: '20s'
    });
    return accessToken;
}

module.exports = { signupController, loginController };