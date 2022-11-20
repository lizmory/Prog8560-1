// import dependencies you will use
const express = require('express');
const path = require('path');
const fileUpload = require('express-fileupload');
const mongoose = require('mongoose');
const session = require('express-session');

//const bodyParser = require('body-parser'); // not required for Express 4.16 onwards as bodyParser is now included with Express
// set up expess validator
const {check, validationResult} = require('express-validator'); //destructuring an object

// connect to DB
mongoose.connect('mongodb://localhost:27017/halloweenStore',{
    useNewUrlParser: true,
    useUnifiedTopology: true
});


// define the model

const Card = mongoose.model('Card', {
    scaryName : String,
    scaryEmail : String,
    scaryDescription : String,
    scaryImageName : String
});

// define model for admin users

const User = mongoose.model('User', {
    uName: String,
    uPass: String
});

// set up variables to use packages
var myApp = express();

// set up the session middleware
myApp.use(session({
    secret: 'superrandomsecret',
    resave: false,
    saveUninitialized: true
}));


// myApp.use(bodyParser.urlencoded({extended:false})); // old way before Express 4.16
myApp.use(express.urlencoded({extended:false})); // new way after Express 4.16
myApp.use(fileUpload()); // set up the express file upload middleware to be used with Express
// set path to public folders and view folders
 
myApp.set('views', path.join(__dirname, 'views'));
//use public folder for CSS etc.
myApp.use(express.static(__dirname+'/public'));
myApp.set('view engine', 'ejs');


var nameRegex = /^[a-zA-Z0-9]{1,}\s[a-zA-Z0-9]{1,}$/;

// set up different routes (pages) of the website
// render the home page
myApp.get('/',function(req, res){
    res.render('home'); // will render views/home.ejs
});
myApp.get('/about',function(req, res){
    res.render('about'); // will render views/about.ejs
});
// render the login page
myApp.get('/login',function(req, res){
    res.render('login'); // will render views/login.ejs
});

myApp.post('/login', function(req, res){
    // fetch username and pass
    var uName = req.body.uname;
    var uPass = req.body.upass;

    // find it in the database
    User.findOne({uName: uName, uPass: uPass}).exec(function(err, user){
        // set up the session variables for logged in users
        console.log('Errors: ' + err);
        if(user){
            req.session.uName = user.uName;
            req.session.loggedIn = true;
            // redirect to dashboard
            res.redirect('/allcards');
        }
        else{
            res.redirect('/login'); // in case you want to redirect the user to login
            // alternatively, render login form with errors
            //res.render('login', {error: 'Incorrect username/password'}); // complete the logic on login.ejs file to show the error only if error is undefined.
        }
    });
});

// show all cards
myApp.get('/allcards',function(req, res){
    if(req.session.loggedIn){
        // write some code to fetch all the cards from db and send to the view allcards
        Card.find({}).exec(function(err, cards){
            console.log(err);
            console.log(cards);
            res.render('allcards', {cards:cards}); // will render views/allcards.ejs
        });
    }
    else{
        res.redirect('/login');
    }
});

myApp.get('/logout', function(req, res){
    // destroy the whole session
    // req.session.destroy();
    // alternatively just unset the variables you had set 
    req.session.uName = '';
    req.session.loggedIn = false;
    res.redirect('/login');
});

// show only one card depending on the id, just like amazon products
// https://www.amazon.ca/dp/B08KJN3333
myApp.get('/print/:cardid', function(req, res){
    // --------add some logic to put this page behind login---------
    // write some code to fetch a card and create pageData
    var cardId = req.params.cardid;
    Card.findOne({_id: cardId}).exec(function(err, card){
        res.render('card', card); // render card.ejs with the data from card
    });
})
// to delete a card from the database
myApp.get('/delete/:cardid', function(req, res){
    // --------add some logic to put this page behind login---------
    var cardId = req.params.cardid;
    Card.findByIdAndDelete({_id: cardId}).exec(function(err, card){
        res.render('delete', card); // render delete.ejs with the data from card
    });
})
// edit a card
myApp.get('/edit/:cardid', function(req, res){
    // --------add some logic to put this page behind login---------
    var cardId = req.params.cardid;
    // write some logic to show the card in a form with the details
    Card.findOne({_id: cardId}).exec(function(err, card){
        res.render('edit', card); // render edit.ejs with the data from card
    });
})

// process the edited form from admin
myApp.post('/editprocess/:cardid', function(req,res){
    if(!req.session.loggedIn){
        res.redirect('/login');
    }
    else{
        //fetch all the form fields
        var scaryName = req.body.scaryName; // the key here is from the name attribute not the id attribute
        var scaryEmail = req.body.scaryEmail;
        var scaryDescription = req.body.scaryDescription;
        var scaryImageName = req.files.scaryImage.name;
        var scaryImageFile = req.files.scaryImage; // this is a temporary file in buffer.
        // check if the file already exists or employ some logic that each filename is unique.
        var scaryImagePath = 'public/uploads/' + scaryImageName;
        // move the temp file to a permanent location mentioned above
        scaryImageFile.mv(scaryImagePath, function(err){
            console.log(err);
        });
        // find the card in database and update it
        var cardId = req.params.cardid;
        Card.findOne({_id: cardId}).exec(function(err, card){
            // update the card and save
            card.scaryName = scaryName;
            card.scaryEmail = scaryEmail;
            card.scaryDescription = scaryDescription;
            card.scaryImageName = scaryImageName;
            card.save();
            res.render('card', card); // render card.ejs with the data from card
        });
        
    }
});




// process the form submission from the user
myApp.post('/process',[
    check('scaryDescription', 'Please enter a description.').not().isEmpty(),
    check('scaryEmail', 'Please enter a valid email').isEmail(),
    check('scaryName', 'Please enter firstname and lastname').matches(nameRegex)
], function(req,res){

    // check for errors
    const errors = validationResult(req);
    console.log(errors);
    if(!errors.isEmpty())
    {
        res.render('home',{er: errors.array()});
    }
    else
    {
        //fetch all the form fields
        var scaryName = req.body.scaryName; // the key here is from the name attribute not the id attribute
        var scaryEmail = req.body.scaryEmail;
        var scaryDescription = req.body.scaryDescription;

        // fetch the file 
        // get the name of the file
        var scaryImageName = req.files.scaryImage.name;
        // get the actual file
        var scaryImageFile = req.files.scaryImage; // this is a temporary file in buffer.

        // save the file
        // check if the file already exists or employ some logic that each filename is unique.
        var scaryImagePath = 'public/uploads/' + scaryImageName;
        // move the temp file to a permanent location mentioned above
        scaryImageFile.mv(scaryImagePath, function(err){
            console.log(err);
        });

        // create an object with the fetched data to send to the view
        var pageData = {
            scaryName : scaryName,
            scaryEmail : scaryEmail,
            scaryDescription : scaryDescription,
            scaryImageName : scaryImageName
        }

        // create an object from the model to save to DB
        var myCard = new Card(pageData);
        // save it to DB
        myCard.save();

        // send the data to the view and render it
        res.render('card', pageData);
    }
});


// setup routes

myApp.get('/setup', function(req, res){

    let userData = [
        {
            uName: 'admin',
            uPass: 'admin'
        }
    ]
    User.collection.insertMany(userData);
    res.send('data added');
});



// start the server and listen at a port
myApp.listen(8080);

//tell everything was ok
console.log('Everything executed fine.. website at port 8080....');


