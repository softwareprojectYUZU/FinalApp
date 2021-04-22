//use express
const express = require('express')
const router = express.Router()

//use express session for session management and authentication
const session = require ('express-session');

//validate information
const { check, validationResult } = require('express-validator');

//sanitise data incoming
const expressSanitizer = require('express-sanitizer');

var util = require('util');

//initialises hashing function bcrypt for password hashing
const bcrypt = require('bcrypt');

//initialises database connection
const mongoose = require('mongoose')
const User = require('./../models/user');
const { db } = require('./../models/user');

//redirectLogin ensures if the user is not logged in, they are redirected away to the login page
const redirectLogin = (req, res, next) => {
    if (!req.session.userId ) {
        res.redirect('./')
    } 
    else { next (); }
}  

//login routes
router.get('/', (req, res) =>  {
    res.render('signin');
})

//ensure signup information is validated
var signinValidate = [check('password').trim().escape()];

//signin/signingin
router.post('/signingin', signinValidate, async (req, res) => {
    const query = req.body.password;
    const {username} = req.body;
    const user = await User.findOne({username}).lean(); //checks username in database
    if (!user){
        res.render('incorrectlogin'); //if login details incorrect, user is alerted
    }
    else{
        const result = bcrypt.compareSync(query, user.password); //compares stored password with inputted password
        if(result == true){
            req.session.userId = req.body.username; //saves username to req.session.userId express session management
            res.redirect('./../home');
        }
        else{
            res.render('incorrectlogin') //if login details incorrect, user is alerted
        }
    }
    
})

//registering routes
//signin/register
router.get('/register', (req, res) =>  {
    res.render('signup');
})

//ensure signup information is validated
var signupValidate = [
    //first name validation
    check('firstname').notEmpty().matches(/^[A-Za-z ]+$/),
    //last name validation
    check('lastname').notEmpty().matches(/^[A-Za-z ]+$/),
    //username validation
    check('username').isLength({ min: 5 }).matches(/^[A-Za-z0-9 ]+$/).matches('[a-z]'),
    //security question validation
    check('securityQuestion').notEmpty().matches(/^[A-Za-z0-9 ]+$/),
    //security answer validation
    check('securityAnswer').notEmpty().matches(/^[A-Za-z0-9 ]+$/),
    //email validation
    check('email').notEmpty().isEmail().trim().escape().normalizeEmail(),
    //password validation
    check('password').isLength({ min: 8 }).matches('[0-9]').matches('[A-Z]').matches('[a-z]').trim().escape(),
    check('password2').trim().escape()];
    
//signin/registering
//this is the route where users can register
router.post('/registering', signupValidate, async (req, res) => {
    const{firstname, lastname, username, password:unSanitisedPassword, password2, email, securityQuestion, securityAnswer:plainAnswer, termsConditionsCheckbox} = req.body;
    const errors = validationResult(req); //check if errors in inputted data
    if (!errors.isEmpty() || unSanitisedPassword != password2 || !termsConditionsCheckbox) {
        res.render('signuperror'); //if any error in inputted data, error will show
    }
    else {
        const userChecker = await User.findOne({username}).lean(); //used to check if username already exists
        const emailChecker = await User.findOne({email}).lean(); //used to check if email already exists
        if (emailChecker){
            res.render('existingaccount'); //if email exists, user will be alerted they already have an account
        }
        else if (userChecker){
            res.render('existingusername'); //if username already exists, user will be alerted to try another
        }
        else{
            const plainPassword = req.sanitize(unSanitisedPassword); //sanitise password
            const password = await bcrypt.hash(plainPassword, 10); //hash password
            const securityAnswer = await bcrypt.hash(plainAnswer, 10); //hash security question answer
            const score = 0; //set default score for the user as 0
            const attemptArr = [] //array for attempted flashcards to be stored


            try{
                //input user details into database
                User.create({
                    firstname,
                    lastname,
                    username,
                    email,
                    password,
                    securityQuestion,
                    securityAnswer,
                    score,
                    attemptArr
                })
                res.render('registersuccess'); //if registration is successful, success page will be rendered            
            }catch(error){
                res.send("An error has occured, please try again later. Here is the error: " + error); //this error should not be displayed
            }
        }
    }
    
});

//reset password routes
//route to check username exists
router.post('/verifyaccount', async(req, res) => {
    const {username} = req.body;
    const user = await User.findOne({username}).lean(); //check username exists in database
    if (!user){
        res.render('incorrectresetpassword'); //if username doesn't exist, cannot proceed
    }
    else{
        res.render('verifyaccount', {userdetails:user}); //if username is found, proceed to resetting password
    }
})

//route to process security answer
router.post('/resetpassword', async(req, res) => {
    const query = req.body.securityAnswer;
    const {username} = req.body;
    const user = await User.findOne({username}).lean(); //retrieves user from database
    if (!user){
        res.send("Error Occured"); //error should never appear
    }
    const result = bcrypt.compareSync(query, user.securityAnswer); //dehashes the security answer and compares inputted answer
        if(result == true){
            //if result is true, it signs the user in and redirects them to a page to reset their password.
            req.session.userId = req.body.username;
            res.render('resetpassword', {userdetails:user});
        }
        else{
            res.render('incorrectresetpassword'); //if security answer incorrect, cannot proceed
        }
})

//validation to ensure new inputted password is up to requirements
var resetValidate = [
    check('password').isLength({ min: 8 }).matches('[0-9]').matches('[A-Z]').matches('[a-z]').trim().escape(),
    check('password2').trim().escape()];

//route to process new password
router.post('/resetting', resetValidate, async(req, res) => {
    const{password:unSanitisedPassword, username} = req.body;
    const user = await User.findOne({username}).lean(); //retrieve user from database again
    if (unSanitisedPassword != req.body.password2){
        res.render('signuperror'); //error shows if two passwords do not match
    }
    else{
        const errors = validationResult(req); //retrieves all errors
        if (!errors.isEmpty()) {
            res.render('signuperror'); //error shows if password is not up to requirement
        }
        else {
            const plainPassword = req.sanitize(unSanitisedPassword); //sanitises new password
            const password = await bcrypt.hash(plainPassword, 10); //hashes password
            //updates the password in database
            User.findOneAndUpdate({password: user.password}, {$set:{password: password}}, {new: true}, function(err, doc) {
                if (err) return res.send(500, {error: err}); //error shouldn't show
                res.render('successresetpassword') //message shown if reset password was successful
            });
        }
    }
})

module.exports = router