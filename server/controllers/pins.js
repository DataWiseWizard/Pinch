const Pin = require('../models/pin')


module.exports.index = async (req, res) => {
    const allPins = await Pin.find({});
    res.render("pins/index.ejs", {allPins});
};

module.exports.renderNewForm = (req, res) => {
    res.render("pins/new.ejs");
};



//Create Pin
module.exports.createPin =async (req, res, next) => {
    let url = req.file.path;
    const newPin = new Pin(req.body.pin);
    newPin.image = {url};
    await newPin.save();
    req.flash("success", "New Listing created!");
    res.redirect("/pins");
};
