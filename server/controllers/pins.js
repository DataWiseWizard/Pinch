const Pin = require('../models/pin')


module.exports.index = async (req, res) => {
    const allPins = await Pin.find({}).populate("postedBy");
    res.render("pins/index.ejs", { allPins });
};

module.exports.renderNewForm = (req, res) => {
    res.render("pins/new.ejs");
};



module.exports.createPin = async (req, res, next) => {
    const newPin = new Pin(req.body.pin);

    // Ensure req.file exists before trying to access its properties
    if (!req.file) {
        req.flash("error", "Image file is required.");
        return res.redirect("/pins/new");
    }

    newPin.image = {
        url: req.file.path,
        filename: req.file.filename
    };
    newPin.postedBy = req.user._id;

    await newPin.save();

    req.flash("success", "New Pin created!");
    res.redirect("/pins");
};

module.exports.showPin = async (req, res) => {
    let { id } = req.params;
    const pin = await Pin.findById(id).populate("postedBy");
    if (!pin) {
        req.flash("error", "Pin you requested does not exist!");
        return res.redirect("/pins");
    }
    res.render("pins/show.ejs", { pin });
};