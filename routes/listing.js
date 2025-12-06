const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js"); //parent tai .. (double use)
const {isLoggedIn, isOwner, validateListing} = require("../middleware.js");
const multer  = require("multer")
const {storage} = require("../cloudConfig.js");
const upload = multer({ storage });

//controllers
const lisitngController = require("../controllers/listings.js");

// no need to write   "/lisitngs"   for every route because the this file only for listings route here -> this is runing because of express.Router();

//for combaine comman path but differnt HTTP verbs or call
router.route("/")
    .get(wrapAsync(lisitngController.index)) //Index Route
    .post(isLoggedIn,upload.single("listing[image]"), validateListing , wrapAsync (lisitngController.createNewListing)); //Create Route

//New Route --> /listings/:id ar oporae rakhchi nahole amer new kw ata id eshabe trite korche tai
router.get("/new",isLoggedIn,lisitngController.renderNewForm);

router.route("/:id")
    .get(wrapAsync(lisitngController.showListing)) //Show Route
    .put(isLoggedIn,isOwner,upload.single("listing[image]"), validateListing, wrapAsync(lisitngController.updateListing)) //Update Route
    .delete(isLoggedIn,isOwner, wrapAsync(lisitngController.destroyListing)); //Delete Route

//Edit Route
router.get("/:id/edit",isLoggedIn, isOwner, wrapAsync(lisitngController.renderEditForm));

module.exports = router;