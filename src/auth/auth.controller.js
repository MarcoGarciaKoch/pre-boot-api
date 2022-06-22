import jwt from 'jsonwebtoken';
import { encodePassword, generateValidationToken } from './auth.utils.js';
import { sendValidationEmail } from '../adapters/email.js';
import { jwt_secret } from './auth.secrets.js';
import { ObjectId } from "mongodb";

/**
 * Check data comes in the body and update early student info. 
 * 1. We need to validate the body.
 * 2. If token exists, get email and course ID from early student document.
 * 3. Add student to the course.
 * 4. Return status of the process.
 */

export const validateEarlyStudent = async (req, res) => {
    const { token } = req.query; // step 1
    try{
        //Check that token already exists on DDBB - pre-boot, collection - earlyStudentsCol.
        //Otherwise, send an error.
        const valToken = await req.app.locals.ddbbClient.earlyStudentsCol.findOne({token})
        //token exists
        if(valToken !== null && valToken.role === 'student') {
            // step 2
            const { email, course } = valToken; 
            const o_id = ObjectId(course);
            // step 3
            const courseToAddStudent = await req.app.locals.ddbbClient.coursesCol.findOne({_id: o_id});
                if(courseToAddStudent !== null) {
                    await req.app.locals.ddbbClient.coursesCol.updateOne({_id: o_id}, {$push: {students: email}});
                }else{
                    res.status(400);
                }
            //step 4
            res.json({email, bootcamp:courseToAddStudent.name, courseId:courseToAddStudent._id})
        }else{
            res.sendStatus(404);
        }
    }catch(err){
        console.error(err);
    } 
}



/**
 * 1. Register data comes in the body. We need to validate the body.
 * 2. Generate user entity and save it in DDBB.
 * 3. Generate validation token and save it in DDBB on associated user.
 * 4. Send email with validation URL.
 */
export const registerCtrl = async (req, res) => {
    try{
        //Check that email does not exist in DDBB - pre-boot, collection - Users. If so send and error message.
        //Otherwise, encrypt the password sent in the body request.
        const user = await req.app.locals.ddbbClient.usersCol.findOne({email: req.body.email});
        if(user === null) {
            req.body.password = encodePassword(req.body.password);
            await req.app.locals.ddbbClient.usersCol.insertOne({ ...req.body, status: 'PENDING_VALIDATION' }); //Step 2
            //Step 3
            const token = generateValidationToken();
            await req.app.locals.ddbbClient.tokenCol.insertOne({token, user: req.body.email});
            //step 4
            // Be aware, host is our react app
            sendValidationEmail(req.body.email, `http://localhost:8100/validate?token=${token}`);
            res.sendStatus(201);
        }else {
            // send error 409(conflict) because user already exists on DDBB.
            res.sendStatus(409);
        }

    }catch (err){
        console.error(err);
        res.sendStatus(500)
    }
}


/**
 * 1. Obetain the token
 * 2. Validate that token exists on DDBB and obtain the associated user.
 * 3. Delet token on DDBB and delete early student document on DDBB.
 * 4. Update user changing status to SUCCESS and adding the role.
 */

export const validateEmailCtrl = async (req, res) => {
    const { token } = req.query; // step 1
    try{
        //Check that token already exists on DDBB - pre-boot, collection - validate-token and update user status.
        //Otherwise, send an error.
        const valToken = await req.app.locals.ddbbClient.tokenCol.findOne({token})
        if(valToken !== null) {
            //token exists
        const { user } = valToken;
        
        const studentData = await req.app.locals.ddbbClient.earlyStudentsCol.findOne({email: user});
        await req.app.locals.ddbbClient.tokenCol.deleteOne({token}); // step 3
        await req.app.locals.ddbbClient.earlyStudentsCol.deleteOne({email: user}); // step 3
        //update the user status to SUCCESS
        const updateDoc = {
            $set: {
                role: studentData.role,
                course: {idCourse: studentData.course, progress: '72b132dc-074a-4ec3-88bb-75ac42a6e96f', order: 1},
                status: 'SUCCESS'
            },
        };
        await req.app.locals.ddbbClient.usersCol.updateOne({email:valToken.user}, updateDoc); //step 4
        res.sendStatus(200)
        }else{
            res.sendStatus(404);
        }
    }catch(err){
        console.error(err);
    }    
}


/**
 * 1. Verify that user exists with password and status is SUCCESS
 *  a. Encrypt the body password
 * 2. Generate a JWT token.
 * 3. Returns it to the user.
 */

export const loginCtrl = async (req, res) => {
    const { email, password } = req.body;

    //step 1
    try{
        const query = {
            email,
            password: encodePassword(password),
            status: 'SUCCESS'
        }
        const user = await req.app.locals.ddbbClient.usersCol.findOne(query);
        if(user !== null){
            //the user exist with this conditions
            const token = jwt.sign({ email: user.email, hola:'pre-boot' }, jwt_secret); // step 2
            res.status(201).json({ access_token: token }); // step 3
        }else {
            res.sendStatus(404);
        }
    }catch(err){
        console.log(err);
    }
}