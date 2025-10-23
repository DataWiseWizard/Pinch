const Pin = require("../models/pin");


module.exports.index = async (req, res) => {
    const allPins = await Pin.find({}).populate("postedBy");
    res.status(200).json(allPins);
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
    res.status(201).json(newPin);
};

module.exports.showPin = async (req, res) => {
    let { id } = req.params;
    const pin = await Pin.findById(id).populate("postedBy");
    if (!pin) {
        return res.status(404).json({ message: "Pin not found." });
    }
    res.status(200).json(pin);
};


module.exports.getUserPins = async (req, res) => {
    const { userId } = req.params;
    const userPins = await Pin.find({ postedBy: userId });
    res.status(200).json(userPins);
};


module.exports.deletePin = async (req, res) => {
    const { id } = req.params;
    const userId = req.user._id;

    const pin = await Pin.findById(id);

    if (!pin) {
        throw new ExpressError(404, "Pin not found.");
    }

    if (!pin.postedBy.equals(userId)) {
        return res.status(403).json({ message: "You are not authorized to delete this pin." });
        // req.flash("error", "You don't have permission to delete this pin.");
        // return res.redirect(`/pins/${id}`);
    }

    await Pin.findByIdAndDelete(id);


    await cloudinary.uploader.destroy(pin.image.filename);

    res.status(200).json({ message: "Pin deleted successfully." });
    req.flash("success", "Pin deleted!");
    res.redirect("/pins"); 
};