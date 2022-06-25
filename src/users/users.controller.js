

export const getUserInfo = async (req, res) => {
    //call the user
    try {
        const query = req.email; // try to find the user by email
        const userOptions = { projection: {_id:0, password:0, status:0 } }
        const userInfo = await req.app.locals.ddbbClient.usersCol.findOne({email: query}, userOptions); // find the user info by email
        const courseOptions = { projection: {_id:0, name:0} }
        const courseInfo = await req.app.locals.ddbbClient.coursesCol.findOne({students: query}, courseOptions); // find the course info by student email
        res.status(200).json({student: userInfo, course: courseInfo}); // return all the user and course info together in the same object
    }catch(err) {
        console.error(err);
        res.sendStatus(500);
    }
}