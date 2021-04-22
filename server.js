const express = require('express');
const app = express();
var bodyParser = require('body-parser');
const session = require ('express-session');
const validator = require ('express-validator');
const expressSanitizer = require('express-sanitizer');

const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/flashcard', { useNewUrlParser: true, useUnifiedTopology: true });


// routes
const signInRouter = require('./routes/signIn');
const homeRouter = require('./routes/home');
const flashcardsRouter = require('./routes/flashcards');
const profileRouter = require('./routes/profile');
const leaderboardRouter = require('./routes/leaderboard');

const methodOverride = require('method-override');

app.listen(7000);

app.use(express.urlencoded({extended: false}));

app.use(methodOverride('_method'))
// static files
app.use(express.static('public'))
app.use('/css', express.static(__dirname + 'public/css'))
app.use('/js', express.static(__dirname + 'public/js'))
app.use('/imgs', express.static(__dirname + 'public/imgs'))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

//added for session management
app.use(session({
    secret: 'somerandomstuffs',
    resave: false,
    saveUninitialized: false,
    maxAge: Date.now() + (30 * 86400 * 1000) ,
    cookie: {
        expires: 600000
    }
}));

app.use(expressSanitizer());



// set views
app.set('views', './views')
app.set('view engine', 'ejs')

// index page
app.get('/', (req, res) => {
    res.render('index')
})

// sign in page
app.use('/signin', signInRouter)

// home page 
app.use('/home', homeRouter)

// flashcards page
app.use('/flashcards', flashcardsRouter)

// profile page
app.use('/profile', profileRouter)

// leaderboard page
app.use('/leaderboard', leaderboardRouter)

