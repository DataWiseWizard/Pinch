const Joi = require('joi');
const passwordComplexity = require('joi-password-complexity');

const complexityOptions = {
  min: 8,
  max: 30,
  lowerCase: 1,
  upperCase: 1,
  numeric: 1,
  symbol: 1,
  requirementCount: 4, // Must meet 4 of the above rules
};

// Signup Schema
module.exports.userSignupSchema = Joi.object({
    username: Joi.string()
        .alphanum()
        .min(3)
        .max(30)
        .required()
        .messages({
            'string.alphanum': 'Username must only contain alpha-numeric characters',
            'string.min': 'Username should have a minimum length of 3',
            'string.max': 'Username should have a maximum length of 30',
        }),
    email: Joi.string()
        .email()
        .required()
        .messages({
            'string.email': 'Please enter a valid email address',
        }),
    password: passwordComplexity(complexityOptions)
        .required()
        .messages({
            'passwordComplexity.tooShort': 'Password must be at least 8 characters long',
            'passwordComplexity.tooLong': 'Password must not exceed 30 characters',
            'passwordComplexity.lowercase': 'Password must contain at least one lowercase letter',
            'passwordComplexity.uppercase': 'Password must contain at least one uppercase letter',
            'passwordComplexity.numeric': 'Password must contain at least one number',
            'passwordComplexity.symbol': 'Password must contain at least one symbol',
        })
});