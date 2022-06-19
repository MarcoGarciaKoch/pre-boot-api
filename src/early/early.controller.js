import jwt from 'jsonwebtoken';
import { sendInviteEmail } from '../adapters/inviteStudentEmail.js';
import { jwt_secret } from '../auth/auth.secrets.js';
import { generateValidationToken } from '../auth/auth.utils.js';


/**
 * Register data comes in the body.
 * 1. We need to validate the body.
 * 2. Generate validation token.
 * 3. Generate early student entity and save it in DDBB.
 * 4. Send email with validation URL.
 */
export const registerEarlyStudent = async (req, res) => {
    try{
        //Check that email does not exist in DDBB - pre-boot, collection - Users. If so send and error message.
        //Otherwise, encrypt the password sent in the body request.
        //Step 1
        const student = await req.app.locals.ddbbClient.earlyStudentsCol.findOne({email: req.body.email, course: req.body.course});
        if(student === null) {
            //step 2
            const token = generateValidationToken();
            //Step 3
            await req.app.locals.ddbbClient.earlyStudentsCol.insertOne({ ...req.body, token});
            //step 4
            // Be aware, host is our react app
            sendInviteEmail(req.body.email, `http://localhost:8100/register?token=${token}`);
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



export const getCourses = async (req, res) => { 
    try{
        //get email from query params
        const {email} = req.query;
        //get school ID from school collection
        const school = await req.app.locals.ddbbClient.potentialClientCol.findOne({email});
        if(school !== null) {
            //get school id from the document received before
            const schoolID = school._id
            //get courses from school collection by school ID
            const courses = await req.app.locals.ddbbClient.coursesCol.find({schoolID: schoolID}).toArray();
            res.json(courses);
        }else{
            // send error 409(conflict) because user already exists on DDBB.
            res.sendStatus(404);
        }
    }catch (err){
        console.error(err);
        res.sendStatus(500)
    }
}

