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
                name: 'JavaScript',
                students: [],
                lessons: [
                    {order: 1, id:'72b132dc-074a-4ec3-88bb-75ac42a6e96f', title: 'Introduccion a JavaScript', tests:''},
                    {order: 2, id:'89341f08-2fc6-4b27-a59c-577b17eedb9b', title: 'Variables y tipos de datos', tests:''},
                    {order: 3, id:'ea5cb501-42d9-4af6-928d-627cf06a742f', title: 'Expresiones y operadores', tests:''},
                    {order: 4, id:'2d529303-7781-4ffc-89d7-8eac3443d122', title: 'Sentencias condicionales', tests:''},
                    {order: 5, id:'aa2157d3-f71d-4ad8-b6a8-999cfb1e3be2', title: 'Funciones de Strings', tests:''},
                    {order: 6, id:'27b1bdaf-7dcd-4be5-bd35-6323c3f03f0c', title: 'Bucles', tests:''},
                    {order: 7, id:'197795a3-26ff-49ea-82f7-01a0922259a3', title: 'Arrays', tests:''},
                    {order: 8, id:'3258fe3e-f8bc-4490-821d-2dc682912d38', title: 'Métodos de Arrays', tests:''},
                    {order: 9, id:'ced7e9da-0d77-40bf-b489-a6dbb43fa3b5', title: 'Funciones', tests:''},
                    {order: 10, id:'8d9f80e3-bc16-4262-bd2f-2a2307530e32', title: 'Objetos', tests:''}
                ]
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