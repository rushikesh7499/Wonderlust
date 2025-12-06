const express = require("express");
const app = express();
const session = require("express-session");
const flash = require("connect-flash")


// const users = require("./routes/user.js");
// const posts = require("./routes/post.js");

app.use(session( {
    secret: "mysupersecretestring",
resave: false,
saveUninitialized:true,
cookie: {
    expire: Date.now() + 7 * 24 * 60 * 1000,
    maxAge: + 7 * 24 * 60 * 1000,
    httpOnly: true,
},
}));

app.use(flash());

app.get("/reqcount", (req, res) =>{
    if(req.session.count){
        req.session.count++
    } else {
        req.session.count = 1;
    }

res.send(`you sent a request ${req.session.count}`);
});

// app.get("/test", (req, res) =>{
//     res.send("test successfull");
// });

app.listen(3000, () =>{
    console.log ("server is listing")
})