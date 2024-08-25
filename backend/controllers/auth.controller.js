// controllers are used to define function, which can also be defined in the routes
// the functions defined in controllers are used in routes, and routes are used in the main file


import User from "../models/user.model.js";
import bcryptjs from 'bcryptjs';
import { errorHandler } from "../utils/error.js";
import jwt from 'jsonwebtoken';

export const signup = async (req, res, next) => {
    const { username, email, password } = req.body;
    const hashedPassword = bcryptjs.hashSync(password, 10);// 10 number of rounds for the salt
    const newUser = new User({ username, email, password: hashedPassword });
    try {
        await newUser.save() //wait until we recieve promise
        res.status(201).json({ message: "User registered succesfully" });
    } catch (error) {
        next(error);
    }
};

export const signin = async (req, res, next) => {
    const { email, password } = req.body;
    try {
        const validUser = await User.findOne({ email })
        if (!validUser) return next(errorHandler(404, 'User not found'));
        const validPassword = bcryptjs.compareSync(password, validUser.password)
        if (!validPassword) return next(errorHandler(401, 'wrong credentials'))
        const token = jwt.sign({ id: validUser._id }, process.env.JWT_SECRET);
        const { password: hashedPassword, ...rest } = validUser._doc;//destructure the password so that it is not shown when data is fetched
        const expiryDate = new Date(Date.now() + 3600000);//1 hour expiry of token
        res.cookie('access_token', token, { httpOnly: true, expires: expiryDate }).status(200).json(rest)//for showing profile information
    } catch (error) {
        next(error)
    }
}

export const google = async (req, res, next) => {
    try {
        let user = await User.findOne({ email: req.body.email });
        if (user) {
            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
            const { password: hashedPassword, ...rest } = user._doc; // Note the use of 'user' here
            const expiryDate = new Date(Date.now() + 3600000); // 1 hour expiry of token
            res.cookie('access_token', token, { httpOnly: true, expires: expiryDate })
               .status(200)
               .json(rest); // for showing profile information
        } else {
            const generatedPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
            const hashedPassword = bcryptjs.hashSync(generatedPassword, 10);
            const newUser = new User({
                username: req.body.name.split(" ").join("").toLowerCase() + Math.random().toString(36).slice(-8),
                email: req.body.email,
                password: hashedPassword,
                profilePicture: req.body.photo
            });
            await newUser.save();
            const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET);
            const { password: hashedPassword2, ...rest } = newUser._doc; // Note the use of 'newUser' here
            const expiryDate = new Date(Date.now() + 3600000); // 1 hour expiry of token
            res.cookie('access_token', token, { httpOnly: true, expires: expiryDate })
               .status(200)
               .json(rest); // for showing profile information
        }
    } catch (error) {
        next(error);
    }
};

export const signout = (req, res) => {
    res.clearCookie('access_token').status(200).json('Signout success!');
  };