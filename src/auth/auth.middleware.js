import * as EmailValidator from 'email-validator';
import jwt from 'jsonwebtoken';
import { jwt_secret } from './auth.secrets.js';



/***
 * Validate that email is correct
 * ...
 * If it isn´t, return error 400 (Bad Request)
 */

export const validateUser = (req, res, next) => {
    // If property email in the body request is valid, then we call the next middleware
    if(EmailValidator.validate(req.body.email)) {
        next(); // call next middleware
    }else{
        res.status(400).json({ error: 'Email not valid.'}) // If email is not valid, send response to client with a warning message.
    }
}


/**
 * Validate the token and if valid, add email to request
 */

export const validateAuth = (req, res, next) => {
    try{
        //Obtain the email from token
        const auth = req.header('Authorization'); // it returns the header value
        console.log('auth', auth)
        // What is the header structure? --> Bearer _token_jwt_
        const token = auth.split(' ')[1]; // obtains the token
        const payload = jwt.verify(token, jwt_secret);
        //add attribute to request
        req.email = payload.email;
        next();
    }catch(err){
        //The token is invalid or it does not exists
        console.error(err);
        res.sendStatus(401);
    }
}