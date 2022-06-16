import * as EmailValidator from 'email-validator';


/***
 * Validate that email is correct
 * ...
 * If it isn´t, return error 400 (Bad Request)
 */

 export const validatePotentialClient = (req, res, next) => {
    // If property email in the body request is valid, then we call the next middleware
    if(EmailValidator.validate(req.body.email)) {
        next(); // call next middleware
    }else{
        res.status(400).json({ error: 'Email not valid.'}) // If email is not valid, send response to client with a warning message.
    }
}