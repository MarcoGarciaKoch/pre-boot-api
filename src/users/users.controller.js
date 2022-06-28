

export const getUserInfo = async (req, res) => {
    //call the user
    try {
        const query = req.email; // try to find the user by email
        const userOptions = { projection: {_id:0, password:0, status:0 } }
        const userInfo = await req.app.locals.ddbbClient.usersCol.findOne({email: query}, userOptions); // find the user info by email
        const courseOptions = { projection: { name:0} }
        const courseInfo = await req.app.locals.ddbbClient.coursesCol.findOne({students: query}, courseOptions); // find the course info by student email
        res.status(200).json({student: userInfo, course: courseInfo}); // return all the user and course info together in the same object
    }catch(err) {
        console.error(err);
        res.sendStatus(500);
    }
}



export const updateCurrentLesson = async (req, res) => {
    const { email, markDownId } = req.body;
    
    try {
        const courseOptions = { projection: {_id:0, lessons:1 } }
        const lessonInfo = await req.app.locals.ddbbClient.coursesCol.findOne({'lessons.id': markDownId.id}, courseOptions); // find the course lesson info by providing lesson ID
        const currentLesson = lessonInfo.lessons.find(l => l.id === markDownId.id)
        const nextLessonId = currentLesson.order + 1;
        const nextLesson = lessonInfo.lessons.find(l => l.order === nextLessonId)
        const updateDoc = {
            $set: {
                course: nextLesson
            },
        };
        await req.app.locals.ddbbClient.usersCol.updateOne({email:email}, updateDoc);

        const userOptions = { projection: {_id:0, name:1, lastname:1 } }
        const userInfo = await req.app.locals.ddbbClient.usersCol.findOne({email: email}, userOptions);
        const updateDocument = {
            $push: {'chat.messages': {userEmail: email, 
                                      message:`El alumno ${userInfo.name} ${userInfo.lastname} ha finalizado la lección ${currentLesson.order}, "${currentLesson.title}."`, 
                                      type:'coding'}},
        };
        await req.app.locals.ddbbClient.coursesCol.updateOne({'lessons.id': markDownId.id}, updateDocument);

        res.status(200).json({nextLesson}); // return all the user and course info together in the same object
    }catch(err) {
        console.error(err);
        res.sendStatus(500);
    }
}