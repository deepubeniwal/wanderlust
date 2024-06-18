const Listing = require("../models/listing.js");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;

const geocodingClient = mbxGeocoding({ accessToken: mapToken});



module.exports.index = ( async(req, res)=>{
    const allListings = await Listing.find({});
    res.render("./listings/index.ejs", {allListings});
     });

//search

module.exports.search = async (req, res) => {
  let { q } = req.query;
  let data = await Listing.find({
    title: { $regex: `${q}*`, $options: "i" },
  })
    .populate({
      path: "reviews",
      populate: {
        path: "author",
      },
    })
    .populate("owner");
  res.render("./listings", { allListings: data });
};


// filters
module.exports.filter = async (req, res) => {
    let { value } = req.params;
    let data = await Listing.find({
      category: value,
    })
      .populate({
        path: "reviews",
        populate: {
          path: "author",
        },
      })
      .populate("owner");
    res.render("./listings", { allListings: data });
  };
    

module.exports.newListing =   (req, res)=>{
    return res.render("./listings/new.ejs");
    
}  ;



module.exports.showListing =  async(req, res)=>{
    const listing = await Listing.findById(req.params.id).populate({path: "reviews", populate: {path: "author"} }).populate("owner");
    if(!listing){
       req.flash("error","Listing you requested for does not exist");
      return  res.redirect("/listings");
    }
    
    res.render("./listings/show.ejs", {listing});
};

module.exports.createListing = async(req, res, next)=>{
   let response = await geocodingClient.forwardGeocode({
        query: req.body.listing.location,
        limit: 1
      })
        .send()
        
        let url = req.file.path;
        let filename = req.file.filename;
        
        const listing = new Listing(req.body.listing);
        listing.image = {url, filename};
        listing.owner =  req.user._id;
        listing.geometry = response.body.features[0].geometry;

    let savedListing = await listing.save();
    console.log(savedListing)
    req.flash("success","New Listing created!");
    res.redirect("/listings");

};


 
module.exports.editListing =async(req, res)=>{
    const listing = await Listing.findById(req.params.id);
    if(!listing){
       req.flash("error","Listing you requested for does not exist");
         res.redirect("/listings");
    }
    let originalImageUrl = listing.image.url;
    console.log(originalImageUrl)
    originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250");
    console.log(originalImageUrl)
    res.render("./listings/edit.ejs", {listing, originalImageUrl});   
    };

module.exports.updatelisting = async(req , res)=>{
    const listing = await Listing.findByIdAndUpdate(req.params.id, {...req.body.listing});

if(typeof req.file !== "undefined"){

    let url = req.file.path;
    let filename = req.file.filename;
    listing.image ={url, filename}
    await listing.save();
}

    req.flash("success","Listing Updated!");
    res.redirect(`/listings/${listing._id}`);
}

module.exports.destroyListing = async(req, res)=>{
    const listing = await Listing.findByIdAndDelete(req.params.id);
    req.flash("success","Listing Deleted!");
    res.redirect("/listings");

};
