// Import libraries
const express = require('express');
const { Mongoose } = require('mongoose');
const flashcard = require('./../models/flashcard');
const marked = require ('marked')
const slugify = require('slugify')
const methodOverride = require('method-override')


const FlashcardTopic = require('./../models/flashcard');
const { query } = require('express');
const User = require('../models/user');
const router = express.Router();

// redirect login function that redirects users
const redirectLogin = (req, res, next) => {
    if (!req.session.userId ) {
        res.redirect('./')
    } 
    else { next (); }
} 
// flashcard page
router.get('/', redirectLogin, (req, res) =>  {
    res.render('flashcards')
})

// create page
router.get('/create',redirectLogin, (req, res) =>  {
res.render('flashcardsCreate', {flashcard: new FlashcardTopic})


})
// menu page
router.get('/menu',redirectLogin, async (req, res) =>  {
    try{

    if (req.query.search){
        //displays search results
        const  SearchRes  = await FlashcardTopic.find({topic: req.query.search})
        res.render('flashcardsMenu', {flashcards: SearchRes})
    } 
    else{
        //displays all flashcards
     const flashcards = await FlashcardTopic.find()
    res.render('flashcardsMenu', {flashcards: flashcards})
    }
}
catch(err){
    //shows err
    console.log(err)
}
  
})


router.get('/:id', async (req, res) => {
    
    const flashcard = await FlashcardTopic.findById(req.params.id)
    const username = req.session.userId;
    const user = await User.findOne({username}).lean();
    // increments users score when they click on flashcard
    var incrementScore = user.score+1;
    User.findOneAndUpdate({username: user.username}, {$set:{score: incrementScore}}, {new: true}, function(err, doc) {
       if (err) return res.send(500, {error: err});
   });
   res.render ('flashcardsAttempt', {flashcard: flashcard})
})






// post route created page
router.post('/created', async (req, res)=> {
    
    const question = req.body.question
    const answer = req.body.answer

        // finds flashcard to add to
        FlashcardTopic.findOneAndUpdate({topic: req.body.topic}, { $addToSet: {flashcard: [{question: question, answer: answer}]}}, function (err, result){
            if (err){
                //log error
                console.log(err)
            } else {
                // if flashcard doesnt exist create a new one
                if (result == null){
                    //save flashcard to database
                    let flashcardTopic = new FlashcardTopic({
                                     topic: req.body.topic,
                                     flashcard: [{question: req.body.question, answer: req.body.answer}],
                                     })
                                     flashcardTopic.save()

                                       res.render('flashcardsCreate',{flashcard: FlashcardTopic})

                }
                else{
                     res.render('flashcardsCreate', {flashcard: FlashcardTopic})


                }
            }
        })

})



// attempt page

router.get('/attempt',redirectLogin, (req, res) =>  {
    res.render('flashcardsAttempt', {flashcard : FlashcardTopic}) 
})
//delete route
router.delete('/:id',redirectLogin, async (req, res) =>{
        // find and delete users flashcards
        await FlashcardTopic.findByIdAndDelete(req.params.id)
        res.redirect('menu')


})


module.exports = router