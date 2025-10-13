const Pin = require("../models/pin");


module.exports.index = async (req, res) => {
    const allPins = await Pin.find({});
    res.render("pins/index.ejs", { allPins });
};

module.exports.renderNewForm = (req, res) => {
    res.render("pins/new.ejs");
};



module.exports.createPin = async (req, res, next) => {
    const newPin = new Pin(req.body.pin);

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


module.exports.getUserPins = async (req, res) => {
    const { userId } = req.params;
    const userPins = await Pin.find({ postedBy: userId });
    res.status(200).json(userPins);
};