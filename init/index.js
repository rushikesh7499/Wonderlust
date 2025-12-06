const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

main()
    .then(() =>{
        console.log("connected to DB");
    }).catch(err=>{
        console.log(err);
    });

async function main() {
   await mongoose.connect(MONGO_URL);
}

const initDB = async()=>{
    await Listing.deleteMany({}); //delete all old data form DB
    initData.data = initData.data.map((obj)=> ({...obj, owner : "68f0ca7d9133cfe400a277d9"}));
    await Listing.insertMany(initData.data); //insert all new data in DB 
    console.log("data was initalized"); 
};

initDB();
