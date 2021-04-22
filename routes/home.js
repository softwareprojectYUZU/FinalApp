// imports
const express = require('express')
const router = express.Router()
const User = require('./../models/user');
const { db } = require('./../models/user');
//redirect function to redirect users to sign in
const redirectLogin = (req, res, next) => {
    if (!req.session.userId ) {
        res.redirect('./')
    } 
    else { next (); }
} 
// logout route
router.get('/logout', redirectLogin, (req, res) => {
    //destroys users session therefore signing user out
    req.session.destroy(err => {
        if (err) {
          return res.send("ERROR OCCURRED"); //error should not show
        }
        res.redirect('/');
        })
})
// home page
router.get('/', redirectLogin, async (req, res) =>  {

    const username = req.session.userId;
    const user = await User.findOne({username}).lean();
    if (user){
        //load home page and render details
        res.render('home', {userdetails:user});
    }
    else{
        res.send("An error has occured, you may not be logged in"); //make it a standard popup on webpage
    }
})

module.exports = router