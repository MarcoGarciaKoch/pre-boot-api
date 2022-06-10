import { MongoClient } from 'mongodb';
import { app } from "./app.js";
import dotenv from "dotenv";

dotenv.config();

const client = new MongoClient(process.env.REACT_APP_MONGOPASSWORD);

async function start() {
    try{
        await client.connect(); //1. Connect with client
        const db = client.db('pre-boot');
        app.locals.ddbbClient = {
            usersCol: db.collection('users'),
            tokenCol: db.collection('validate-token'),
            client: client
        }; //2. Save it in Locals to access from routes
        app.listen(4000, () => console.log('Server running on 4000'));
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