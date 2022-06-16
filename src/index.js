import { MongoClient } from 'mongodb';
import { app } from "./app.js";
import 'dotenv/config';

// process.env.PORT indicates to Heroku where to run in the destiniy server.
// Otherwise, the server will be run in the local host 4000
const port = process.env.PORT || 4000; 

const client = new MongoClient(process.env.REACT_APP_MONGOURI);

async function start() {
    try{
        await client.connect(); //1. Connect with client
        const db = client.db('pre-boot');
        app.locals.ddbbClient = {
            usersCol: db.collection('users'),
            tokenCol: db.collection('validate-token'),
            potentialClientCol: db.collection('schools'),
            earlyStudentsCol: db.collection('early-students'),
            coursesCol: db.collection('courses'),
            client: client
        }; //2. Save it in Locals to access from routes
        app.listen(port, () => console.log(`🔥Server running on port ${port}🔥`));
    }catch(err){
        console.err('Error on server: ', err);
    }
}

async function stop() {
    console.log('Closing server');
    await client.close() // Closing conexion with DDBB
}

process.on('SIGINT', stop); // O.S events like Ctrl+C
process.on('SIGTERM', stop);

start(); // Calling start function that initializes both DDBB and Express Server