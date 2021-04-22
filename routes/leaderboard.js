//imports
const express = require('express')
const router = express.Router()
const user = require('./../models/user')
//leaderboard page
router.get('/', async (req, res) =>  {
    //display users in order from low to high
    const UserList = await user.find().sort({score: -1});
    res.render('leaderboard',{username:UserList} )

});

module.exports = router