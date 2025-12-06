const Listing = require("../models/listing.js");
const axios = require("axios");

module.exports.index = async (req,res)=>{ //index route
    const allListing = await Listing.find({});
    res.render("./listings/index.ejs",{allListing}); //for find the sub fille in another directory
};

module.exports.renderNewForm = (req,res)=>{  //new Route
    res.render("./listings/new.ejs");
};

module.exports.showListing = async (req,res)=>{ //Show Route
    let {id} = req.params;
    let listing = await Listing.findById(id).populate({path : "reviews",populate : {path:"author"}}).populate("owner"); //poulate extract all review details from particular listing 
    if(!listing){
        req.flash("error","Listing for you requesting does not exist !");
        res.redirect("/listings");
    }else{ //this line necessary (unless show this error -> Error [ERR_HTTP_HEADERS_SENT]: Cannot set headers after they are sent to the client)
        res.render("./listings/show.ejs",{listing});
    }
    
};

module.exports.createNewListing =  async (req,res)=>{ //Create Route
    /* let {title,description,image,price,location,country} =  req.body; //long step
    
    const newListing = new Listing({
        title : title,
        description : description,
        image : image,
        price : price,
        location : location,
        country : country,
    });*/

    //bulki process for again and again writing --> create a function
    // let result = listingSchema.validate(req.body);
    // // console.log(result);
    // if(result.error){ //best way to error handling using Joi(read docs please)
    //     throw new ExpressError(400,result.error);
    // }

    const response = await axios.get("https://nominatim.openstreetmap.org/search", {
        params: {
            q: req.body.listing.location,
            format: "json",
            limit: 1,
        },
    });


    let url = req.file.path; //need for cloudinary
    let filename = req.file.filename; //need for cloudinary

    const newListing = new Listing(req.body.listing); //abstact all the details
    newListing.owner = req.user._id;
    newListing.image = {url, filename};
    
    //but Mongoose GeoJion needs first longitude then latitude (opssite).
    newListing.geometry = {
        type : "Point",
        coordinates: [
            parseFloat(response.data[0].lon),
            parseFloat(response.data[0].lat)
        ]
    };

    let saveListing = await newListing.save();
    console.log(saveListing);
    req.flash("success","New Listings Created !");
    res.redirect("/listings");

};

module.exports.renderEditForm = async (req,res)=>{  //Edit Route
    let {id} = req.params;
    let listing = await Listing.findById(id);
    if(!listing){
        req.flash("error","Listing for you requesting to edit does not exist !");
        res.redirect("/listings");
    }else{
        let originalImageUrl = listing.image.url;
        //use cloudiary api for deincesing image quality...
        originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250");
        res.render("./listings/edit.ejs",{listing, originalImageUrl});
    }
};

module.exports.updateListing = async (req,res)=>{ //Update Route
    // if(!req.body.listing){
    //     throw new ExpressError(404,"send a valid data for listing");
    // }
    let {id} = req.params;
    let listing =  await Listing.findByIdAndUpdate(id,{ ...req.body.listing}); //deconstruct all data from req.body

    if(typeof req.file !== "undefined"){ // jodi file exist kore thobei ata cholbe na hole cholbe na
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = {url, filename};
        await listing.save();
    }

    req.flash("success","Listing Updated!");
    res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async (req,res)=>{
    let {id} = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success","Listings was deleted!");
    res.redirect("/listings");
};