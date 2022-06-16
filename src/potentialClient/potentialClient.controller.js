import { encodePassword } from './potentialClient.utils.js';

/**
 * Register data comes in the body. 
 * 1. We need to validate the body.
 * 2. Generate potentialClient entity and save it in DDBB.
 * 3. Get school ID from inserting in DDBB and add course entity to course collection.
 */

 export const registerPotentialClient = async (req, res) => {
    try{
        //Check that email does not exist in DDBB - pre-boot, collection - potential-client. If so, send email again.
        //Step 1
        const potentialClient = await req.app.locals.ddbbClient.potentialClientCol.findOne({email: req.body.email});
        //Step 2
        if(potentialClient === null) {
            const password = encodePassword('codinghub');
            const name = 'Coding Hub';
            const avatar = 'https://cdn-icons.flaticon.com/png/512/2115/premium/2115955.png?token=exp=1655227792~hmac=b2b7bf03bfe3b698d0b1b8be51e6cadf';
            const schoolID = await req.app.locals.ddbbClient.potentialClientCol.insertOne({ 
                ...req.body,
                password,
                name,
                avatar,
                status: 'SUCCESS' });
             //Step 3
            await req.app.locals.ddbbClient.coursesCol.insertOne({ 
                schoolID: schoolID.insertedId,
                name: 'Full Stack Web Development',
                students: [],
                resources: 'All the resources needed for the course'
                 });
            res.sendStatus(201);
        }else{
            // send error 409(conflict) because user already exists on DDBB.
            res.sendStatus(409);
        }
    }catch (err){
        console.error(err);
        res.sendStatus(500)
    }
}