

export const getUserInfo = async (req, res) => {
    //call the user
    try {
        const query = {email: req.email}; // try to find the user by email
        const options = { projection: { _id: 0, password: 0, status: 0 } } // return only the email
        const user = await req.app.locals.ddbbClient.usersCol.findOne(query, options); //
        res.json(user); // return user info
    }catch(err) {
        console.error(err);
        res.sendStatus(500);
    }
}