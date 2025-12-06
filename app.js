
if (process.env.NODE_ENV != "production") {
    require('dotenv').config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const MongoStore = require('connect-mongo');
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");
const flash = require("connect-flash");

// Routers
const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

const dbUrl = process.env.ATLASDB_URL;
                          
main()
    .then(()=>{
        console.log("connected to DB");
    }).catch((err)=>{
        console.log(err);
    });

async function main(){
    await mongoose.connect(dbUrl);
}

app.set("view engine", "ejs"); 
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true})); //ensure that express read the url data
app.use(methodOverride("_method")); //for useing put,upadte and delete in form
app.engine("ejs",ejsMate);
app.use(express.static(path.join(__dirname,"/public")));

const store = MongoStore.create({
    mongoUrl : dbUrl,
    crypto : {
        secret : process.env.SECRET,
    },
    touchAfter : 24 * 3600,
});


store.on("error", (err) => {
    console.log("ERROR in MONGO SESSION STORE", err);
});

const sessionOptions = {
    store,
    secret : process.env.SECRET,
    resave : false,
    saveUninitialized : true,
    cookie : {
        expires : Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days calualtion
        maxAge : 7 * 24 * 60 * 60 * 1000,
        httpOnly : true, // for security (protect for cross scripting attack)
    },
};

app.use(session(sessionOptions)); 
app.use(flash());

//passport use
//passport always use after sessionOptions middleware because One session need only one time Sign-Up
app.use(passport.initialize()); //A middleware that initialize passport..
app.use(passport.session()); //this things remeber User login 

// use static authenticate method of model in LocalStrategy
passport.use(new LocalStrategy(User.authenticate()));

// use static serialize and deserialize of model for passport session support
passport.serializeUser(User.serializeUser()); // store for  sign-up info
passport.deserializeUser(User.deserializeUser()); //use for delete sign-up info 

//use locals that directly use in EJS template


// app.js snippet:
app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user; // <-- This is where currUser is defined
    next();
});



// this line must write after main root otherwise this is not working
app.use("/listings",listingRouter); //use for all lisitngs route 
app.use("/listings/:id/reviews",reviewRouter);
app.use("/",userRouter);

//handel when user try to redirect new route but that type route doesn't exist so give err
app.use((req,res,next)=>{ //alternative for non existing route err handeling
    next(new ExpressError(404,"Page Not Found!"));
});
// app.all("*", (req,res,next) => { //this Bcoz it is not compatible with latest version of express This method works with express ver 4
//     next(new ExpressError(404,"Page Not Found !"));
// });

//all err handling via one middleware
app.use((err,req,res,next)=>{
    let {statusCode=500, message="something went wrong !"} = err;
    res.status(statusCode).render("error.ejs",{message});
    // res.status(statusCode).send(message);
});

app.listen(8080,()=>{
    console.log("server is lesting on port 8080");
});