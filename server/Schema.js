const Joi = require("joi");

module.exports.pinSchema = Joi.object({
    listing : Joi.object({
        title: Joi.string().required(),
        destination: Joi.string().required(),
        image: Joi.valid('image/jpeg', 'image/png', 'image/gif').required(),
        userId: Joi.string(),
        category: Joi.string(),
        
    }).required()
});
