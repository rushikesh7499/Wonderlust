const mongoose = require("mongoose");
const Schema = mongoose.Schema; //short cut jathe bar bar lekh the na hoy
const Review = require("./review.js");

const listingSchema = new Schema({
    title:{
        type: String,
        require : true,
    },

    description : String,

    image :{
        url: String,
        filename: String,
    },

    price: Number,
    location : String,
    country : String,
    reviews:[  //One to Many (//Approach 2)
        {
            type: Schema.Types.ObjectId,
            ref: "Review",
        },
    ],
    owner:{
        type: Schema.Types.ObjectId,
        ref: "User",
    },
    geometry : {
        type: {
            type: String, // Don't do `{ location: { type: String } }`
            enum: ['Point'], // 'location.type' must be 'Point'
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    }
});

//delete hook (When user delete listing so that time all the associcate reviews are delee form data base).
listingSchema.post("findOneAndDelete", async(listing) => {
    if(listing){
        await Review.deleteMany({_id : {$in : listing.reviews}});
    }
});
const Listing = mongoose.model("Listing",listingSchema); //create a model
module.exports = Listing; //export