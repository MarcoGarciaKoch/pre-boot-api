

export const getUserInfo = async (req, res) => {
    //call the user
    try {
        const query = {email: req.email}; // try to find the user by email
        const options = { projection: { _id: 0, password: 0, status: 0, role: 1, course: 1 } } // return only the email
        const user = await req.app.locals.ddbbClient.usersCol.findOne(query, options); //
        res.json(user); // return user info
    }catch(err) {
        console.error(err);
        res.sendStatus(500);
    }
}


export const getCourseInfo = async (req, res) => {
    //call the user
    try {
        const query = {course: req.course}; // try to find the course in the candidate´s data
        const courseInfo = await req.app.locals.ddbbClient.coursesCol.findOne(query); //
        const options = { projection: { _id: 0, name: 1, description: 1, price: 1, image: 1 } } // return only the email
        const course = await req.app.locals.ddbbClient.coursesCol.findOne(query, options); //
        res.json(course); // return user info
    }catch(err) {
        console.error(err);
        res.sendStatus(500);
    }
}