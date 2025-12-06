const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new Schema({
    email:{
        type : String,
        required : true,
    },
});

//add plugin for auto username and password with hasing & salting (add Authentication/Authorized).
userSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model("User",userSchema);
