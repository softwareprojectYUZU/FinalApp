//imports
const express = require('express')
const router = express.Router()

//use express session for session management and authentication
const session = require ('express-session');

//initialises database connection
const mongoose = require('mongoose')
const User = require('./../models/user');
const { db } = require('./../models/user');
// redirect function to redirect users to sign in
const redirectLogin = (req, res, next) => {
    if (!req.session.userId ) {
        res.redirect('./')
    } 
    else { next (); }
} 
// profile page
router.get('/', redirectLogin, async (req, res) =>  {
    const username = req.session.userId;
    const user = await User.findOne({username}).lean();
    if (user){
        res.render('profile', {userdetails:user});
    }
    else{
        res.send("An error has occured, you may not be logged in"); //make it a standard popup on webpage
    }
 
})

module.exports = router