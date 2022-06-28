import express from "express";
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import authRouter from './auth/auth.router.js';
import userRouter from './users/users.router.js';
import earlyRouter from './early/early.router.js';
import potentialClientRouter from './potentialClient/potentialClient.router.js';
import { validateAuth } from './auth/auth.middleware.js';
import { ObjectId } from "mongodb";


export const app = express();
export const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:8101",
        methods: ["GET", "POST"]
      }
});

app.use(cors()); // Middleware to alows communication between front server and back server, ensuring some security.
app.use(express.json()) //Middleware that reads the body (string in JSON format) and transforms into an JavaScript object.

app.get('/ping', (_req,res) => res.send('pong')); // ping to ensure that express server is runnig
app.use('/potentialclient', potentialClientRouter); // Declare the router for the potential client
app.use('/early', earlyRouter); // Declare the router for the early users')
app.use('/auth', authRouter); // Declare authetication router
app.use('/users', validateAuth, userRouter); // Declare user router


app.use('/assets', express.static('assets'));


io.on('connection', async (socket) => { // funcion que se ejecuta cuando un usuario se conecta
    console.log('a user connected');
    app.locals.course = socket.handshake.query.courseId;
    app.locals.email = socket.handshake.query.user;
    app.locals.socketId = socket.id;

    const updateUser = {
        $set: { socketId: app.locals.socketId}
    };
    await app.locals.ddbbClient.usersCol.updateOne({email:app.locals.email}, updateUser)

    const getChatInfo = async (courseId, email) => {
        //call the user
        try {
            const course = courseId; // try to find the course by its ID
            const o_id = ObjectId(course);
            const updateDoc = {
                $addToSet: {'chat.usersConected': email},
            };
            await app.locals.ddbbClient.coursesCol.updateOne({_id: o_id}, updateDoc);
            const chatOptions = { projection: {_id:0, chat:1} }
            const chat = await app.locals.ddbbClient.coursesCol.findOne({_id: o_id}, chatOptions);
            return chat; // return all the users connected and messages together in the same object
        }catch(err) {
            console.error(err);
            return 500;
        }
    }
    const chatData = await getChatInfo(app.locals.course, app.locals.email)
    io.emit('user conected', chatData); // Send to all conected students and chat data to both array of conected students and array of messages


    socket.on('chat message', async (msg) => {
        console.log('que es', msg)
        const saveAndGetMessages = async messageDetails => {
            try {
                const o_id = ObjectId(messageDetails.courseId);
                const updateDoc = {
                    $push: {'chat.messages': {userEmail:messageDetails.email, message:messageDetails.body, type:'superchat'}},
                };
                await app.locals.ddbbClient.coursesCol.updateOne({_id: o_id}, updateDoc);
                const chatOptions = { projection: {_id:0, chat:1} }
                const chat = await app.locals.ddbbClient.coursesCol.findOne({_id: o_id}, chatOptions);
                return chat; // return all the users connected and messages together in the same object
            }catch(err) {
                console.error(err);
                return 500;
            }
        }
        const chatData = await saveAndGetMessages(msg)
        io.emit('chat message', {chatData, id:msg.senderId}); //Send to all conected student the list of messages and list of conected students
      });

      socket.on('disconnect', async () => {
        console.log('user disconnected');
        const userData = await app.locals.ddbbClient.usersCol.findOne({socketId: app.locals.socketId})
        console.log('userData', userData)

        const o_id = ObjectId(app.locals.course);
        console.log('email',app.locals.email) 
        const updateUserConnectedList = {
            $pull: {'chat.usersConected': app.locals.email },
        };
        await app.locals.ddbbClient.coursesCol.updateOne({_id: o_id}, updateUserConnectedList);
      })
})


app.get('/hello', (_req,res) => {
    res.send(`Hello World desde express: ${process.env.DEMO_MY_VAR}`);
})

// app.get('/demo',(req,res,next) => {
//     const cumpleValidacion = true;
//     if(!cumpleValidacion){
//         res.status(400).send(); // envio un 400
//         // ya no se ejecuta nada mas se termina la peticion
//     }else{
//         next(); // sirve para pasar el control al siguiente controlador registrado
//     }
    
// }, (req, res) => {
//     res.send('Hello demo');
// })