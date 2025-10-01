const Joi = require("joi");

module.exports.pinSchema = Joi.object({
    title: Joi.string().required(),
    destination: Joi.string().required(),
}).required();