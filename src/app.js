import express from "express";
import cors from 'cors';
import authRouter from './auth/auth.router.js';
import userRouter from './users/users.router.js';
import { validateAuth } from './auth/auth.middleware.js';

export const app = express();

app.use(cors()); // Middleware to alows communication between front server and back server, ensuring some security.
app.use(express.json()) //Middleware that reads the body (string in JSON format) and transforms into an JavaScript object.

app.get('/ping', (_req,res) => res.send('pong')); // ping to ensure that express server is runnig
app.use('/auth', authRouter); // Declare authetication router
app.use('/users', validateAuth, userRouter);

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