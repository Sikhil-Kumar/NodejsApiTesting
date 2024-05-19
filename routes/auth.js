const express = require('express')
const User = require('../models/User')
const router = express.Router()
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fetchuser = require('../middleware/fetchuser')

const JWT_SECRET = "You are a good boy"



const { query, matchedData, body, validationResult } = require('express-validator');


//route 1
//create user
router.post('/createuser', [

    body('name', "Enter a valid name(length > 3)").isLength({ min: 3 }),
    body('email', "Enter a valid and unique email").isEmail(),
    body('password', "Password length should be more than 5").isLength({ min: 5 }),

], async (req, res) => {

    const errors = validationResult(req);


    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    let user = await User.findOne({ email: req.body.email })
    if (user) {
        return res.status(400).json({ error: "Sorry a user with this email already exists" })
    }

    const salt = await bcrypt.genSalt(10)
    const securePassword = await bcrypt.hash(req.body.password, salt)

    user = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: securePassword,
    })
    const data = {
        user: {
            id: user.id
        }
    }
    var token = jwt.sign(data, JWT_SECRET);

    res.json({ token })

})


//route 2
//authenticate the user
router.post('/login', [

    body('email', "Enter a valid and unique email").isEmail(),
    body('password', "Password cannot be blank").exists(),

], async (req, res) => {

    const errors = validationResult(req);


    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body
    try {
        let user = await User.findOne({ email })
        if (!user) {
            return res.status(400).json({ error: "Please Try logging in with the correct credentials" })
        }

        const passwordCompare = await bcrypt.compare(password, user.password)
        if (!passwordCompare) {
            return res.status(400).json({ error: "Please Try logging in with the correct credentials" })
        }
        const data = {
            user: {
                id: user.id
            }
        }
        var token = jwt.sign(data, JWT_SECRET);
        res.json({ token })

    } catch (err) {
        console.log(err);
    }

})


//route 3
// get user details using post method /api/auth/getUser .Login required

router.get('/getUser', fetchuser, async (req, res) => {

    try {
        const userId = req.user.id
        const user = await User.findById(userId).select("-password")
        res.send(user)
    } catch (error) {
        console.log(error);
    }

})

router.post('/forgotpassword', [
    body('email', "Enter a valid email").isEmail()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            return res.status(400).json({ error: "User with this email does not exist" });
        }

        const token = crypto.randomBytes(20).toString('hex');
        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
        await user.save();
res.json({token})
    //     const transporter = nodemailer.createTransport({
    //         service: 'Gmail',
    //         auth: {
    //             user: 'your-email@gmail.com',
    //             pass: 'your-email-password'
    //         }
    //     });

    //     const mailOptions = {
    //         to: user.email,
    //         from: 'your-email@gmail.com',
    //         subject: 'Password Reset',
    //         text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n
    //                Please click on the following link, or paste this into your browser to complete the process:\n\n
    //                http://${req.headers.host}/resetpassword/${token}\n\n
    //                If you did not request this, please ignore this email and your password will remain unchanged.\n`
    //     };

    //     transporter.sendMail(mailOptions, (err, response) => {
    //         if (err) {
    //             console.error('There was an error: ', err);
    //         } else {
    //             res.status(200).json('Recovery email sent');
    //         }
    //     });
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});


router.post('/resetpassword/:token', [
    body('password', "Password length should be more than 5").isLength({ min: 5 })
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const user = await User.findOne({
            resetPasswordToken: req.params.token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ error: "Password reset token is invalid or has expired" });
        }

        const salt = await bcrypt.genSalt(10);
        const securePassword = await bcrypt.hash(req.body.password, salt);

        user.password = securePassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        await user.save();
        res.status(200).json({ message: "Password has been reset" });
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});

module.exports = router;



module.exports = router;