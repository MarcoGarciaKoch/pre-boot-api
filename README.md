# Pre-Boot Platform (Final Project - Full-Stack Bootcamp)

This project consists of the creation of a pre-course platform for students that are about to start a development bootcamp or a programming course.

The technological stack used was:

- **Front-end**: Ionic 6 + ReactJS 17.0 with TypeScript + Monaco Editor.
- **Back-end**: NodeJS + ExpressJS 4 + socekt.io.
- **Database**: MongoDB 4.

NOTE: The use of Ionic, TypeScript, Monaco Editor, socket.io and static servers (to display markdown files on the client) are technologies not seen during the bootcamp. I agreed with my Head Teacher to take the challenge and try to implement them in my project. Note that I only had 3 weeks time to develop this project.

The applicación has this main features:

- The user can chat in real time with the rest of students.
- In the chat the user can track what lessons has been finished already by any student.
- The user can track his/her own progress.
- The user can access the lessons in order and will not be able to go to next lesson until current one is finished.
- The user can practice the lesson exercises in the integrated code editor.
- The user can change the code editor theme and select the programming language (currently only JavaScript available).
- In the lesson area, the user can open the student chat to read and write messages.
- At any time, the user can change between light and dark mode and between spanish or english languages.


# Repository Structure

There are 2 different repos:

- pre-boot-api: NodeJS application with Express that includes a Rest API (full CRUD). It also includes sockect.io for real time operations like the student chat.
> GitHub link: https://github.com/MarcoGarciaKoch/pre-boot-api.git
- pre-boot-app: ReactJS application with the _Ionic_ extension that helps us to create a hybrid application deployable in the markets.
> GitHub link: https://github.com/MarcoGarciaKoch/pre-boot-app.git


# Backend

One of the remarkable implementations of the API is the use socket.io to handle all the real-time events on the student chat.

```ts
// app.js

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
        origin: process.env.CORS_ORIGIN,
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


io.on('connection', async (socket) => { // function that executes when a user (student) connects to the platform
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
            const chatOptions = { projection: {_id:0, chat:1, students: 1} }
            const chat = await app.locals.ddbbClient.coursesCol.findOne({_id: o_id}, chatOptions);
            const usrQuery = { "email": { "$in": chat.students } };
            const usrOptions = { projection: {_id:0, email:1, name: 1, lastname: 1, avatar: 1} }
            const usersInfo =  await app.locals.ddbbClient.usersCol.find(usrQuery, usrOptions).toArray();
            return {...chat, users: usersInfo}; // return all the users connected and messages together in the same object
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
                const chatOptions = { projection: {_id:0, chat:1, students: 1} }
                const chat = await app.locals.ddbbClient.coursesCol.findOne({_id: o_id}, chatOptions);
                const usrQuery = { "email": { "$in": chat.students } };
                const usrOptions = { projection: {_id:0, email:1, name: 1, lastname: 1, avatar: 1} }
                const usersInfo =  await app.locals.ddbbClient.usersCol.find(usrQuery, usrOptions).toArray();
                return {...chat, users: usersInfo}; //  // return all the users connected and messages together in the same object
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
        try{
            const userData = await app.locals.ddbbClient.usersCol.findOne({socketId: app.locals.socketId})
            console.log('userData', userData)

            const o_id = ObjectId(app.locals.course); 
            const updateUserConnectedList = {
                $pull: {'chat.usersConected': app.locals.email },
            };
            await app.locals.ddbbClient.coursesCol.updateOne({_id: o_id}, updateUserConnectedList);
        }catch{
            console.error(err);
            return 500;
        }
        const o_id = ObjectId(app.locals.course);
        const userListOptions = { projection: {_id:0, 'chat.usersConected':1} };
        const userConectedList = await app.locals.ddbbClient.coursesCol.findOne({_id: o_id}, userListOptions);
        io.emit('user conected list', userConectedList) // Send user connected lis updated to all connected users
      })
})
```


# Front-end

Some of the remarkable implementations of the APP are the use of Ionic and TypeScript as well as the display of the markdown files on the working area and the implementation of a coding editor using Monaco editor.

An example of the Monaco editor implementation below:

```tsx
// codingArea/landing.tsx

import { useEffect, useState } from "react";
import CodeEditorWindow from './codingEditor/codeEditorWindow';
import { languageOptions } from './constants/languageOptions';
import { defineTheme } from './themeDropdown/defineTheme';
import { useKeyPress } from '../../../../core/users/user.hook';
import OutputWindow from './outputWindow/outputWindow';
import CustomInput from './customInput/customInput';
import OutputDetails from './outputDetails/outputDetails';
import ThemeDropdown from './themeDropdown/themeDropdown';
import LanguagesDropdown from './languageDropdown/languagesDropdown';
import { IonButton, IonItem, IonLabel, useIonToast } from "@ionic/react";
import { config } from '../../../../config';
import './style.css';
import { useNextLesson } from '../../../../core/users/user.hook';
import { useHistory } from "react-router";
import { useTranslation } from 'react-i18next';


const javascriptDefault = `// Completa los ejercicios`;
const themeDefault = "oceanic-next";


const Landing = ({markDownId, email}:any) => {
  const [code, setCode] = useState(javascriptDefault);
  const [customInput, setCustomInput] = useState("");
  const [outputDetails, setOutputDetails] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [theme, setTheme] = useState(themeDefault);
  const [language, setLanguage] = useState(languageOptions[0]);
  const [present, dismiss] = useIonToast();
  const { getNextLesson, nextLessonData}  = useNextLesson();
  const history = useHistory();
  const [t, i18n] = useTranslation('translation');

  const enterPress = useKeyPress("Enter");
  const ctrlPress = useKeyPress("Control");

  const onSelectChange = (sl:any) => {
    console.log("selected Option...", sl);
    setLanguage(sl);
  };

  useEffect(() => {
    if (enterPress && ctrlPress) {
      console.log("enterPress", enterPress);
      console.log("ctrlPress", ctrlPress);
      handleCompile();
    }
  }, [ctrlPress, enterPress]);


  const onChange = (action:any, data:any) => {
    switch (action) {
      case "code": {
        setCode(data);
        break;
      }
      default: {
        console.warn("case not handled!", action, data);
      }
    }
  };


  const handleCompile = () => {
    setProcessing(true);
    const formData = {
      language_id: language.id,
      // encode source code in base64
      source_code: btoa(code),
      stdin: btoa(customInput),
    };
    const options = {
      method: "POST",
   
      headers: {
        "content-type": "application/json",
        "Content-Type": "application/json",
        "X-RapidAPI-Host": config.RAPID_API_HOST,
        "X-RapidAPI-Key": config.RAPID_API_KEY,
      },
      body: JSON.stringify(formData),
    };

     try {
      fetch(`${config.RAPID_API_URL}?base64_encoded=true&fields=*`, options)
      // fetch('https://b86c1a44-8b0f-4e23-8044-76d75955c98a.mock.pstmn.io/submissions?base64_encoded=true&fields=*')
      .then(r => r.json())
      .then(d => {
        const token = d.token;
        checkStatus(token);
      })
    } catch(err:any){
        let error = err.response ? err.response.data : err;
        setProcessing(false);
        console.log(error);
      };
  };




  const checkStatus = async (token:string) => {
      const options = {
        method: "GET",
      
        headers: {
          "X-RapidAPI-Host": config.RAPID_API_HOST,
          "X-RapidAPI-Key": config.RAPID_API_KEY,
        },
      };
      try {
        await fetch(`${config.RAPID_API_URL}/${token}?base64_encoded=true&fields=*`, options)
        // await fetch('https://b86c1a44-8b0f-4e23-8044-76d75955c98a.mock.pstmn.io/submissions/04b04da4-248e-4cf5-84e0-a80818e035fb?base64_encoded=true&fields=*')
        .then(r => r.json())
        .then(d => {
        const statusId = d.status?.id;
        // Processed - we have a result
        if (statusId === 1 || statusId === 2) {
          // still processing
          setTimeout(() => {
            checkStatus(token)
          }, 2000)
          return
        
        }else {
          setProcessing(false)
          setOutputDetails(d) 
          showSuccessToast(`Compiled Successfully!`)
          console.log('response.data', d) 
          return
        }
        })
      }catch (err) {
        console.log("err", err);
        setProcessing(false);
        showErrorToast(err);
      }
  };


  function handleThemeChange(th:any) {
    defineTheme(th.detail.value).then(() => setTheme(th.detail.value));
  }

  
  useEffect(() => {
    defineTheme(themeDefault);
  },[]);

  const showSuccessToast = (msg:any) => {
    present({
      message: msg || `Compiled Successfully!`,
      position: "top",
      duration: 3000,
      animated: true
    });
    dismiss();
  };
  const showErrorToast = (msg:any) => {
    present({
      message: msg || `Something went wrong! Please try again.`,
      position: "top",
      duration: 3000,
      animated: true
    });
    dismiss();
  };


  const nextLesson = async (e:any) => {
    e.preventDefault();
      const markDownIdAndEmail = {
           email: email,
           markDownId: markDownId
      };
     const data = await getNextLesson(markDownIdAndEmail);
     history.push(`/student/working-area/${data.nextLesson.id}`)
  }
  


  return (
    <div className="monaco__container">
        <IonItem color="light" lines="none" className="language-dropdown__container ion-justify-content-between">
          <IonLabel>{t('specific.workingArea.language')}</IonLabel>
          <LanguagesDropdown onSelectChange={onSelectChange} />
        </IonItem>
        <IonItem color="light" lines="none"  className="theme-dropdown__container ion-justify-content-between">
          <IonLabel>{t('specific.workingArea.theme')}</IonLabel>
          <ThemeDropdown handleThemeChange={handleThemeChange} theme={theme} />
        </IonItem>
        <div>
          <CodeEditorWindow
            code={code}
            onChange={onChange}
            language={language?.value}
            theme={theme}
          />
        </div>
        <OutputWindow outputDetails={outputDetails}></OutputWindow>
        <CustomInput
          customInput={customInput}
          setCustomInput={setCustomInput}
        >
        </CustomInput>
        <div className="code-window-buttons__container">
          <IonButton
            color='secondary'
            className="ion-padding  code-editor-button"
            onClick={handleCompile}
            disabled={!code}
          >
            {processing ? "Processing..." : `${t('specific.workingArea.checkButton')}`}
          </IonButton>
          <IonButton color="warning" className="ion-padding  code-editor-button">{t('specific.workingArea.showButton')}</IonButton>
          <IonButton color="success" className="ion-padding  code-editor-button" onClick={nextLesson}>{t('specific.workingArea.nextButton')}</IonButton>
        </div>
        {outputDetails && <OutputDetails outputDetails={outputDetails} />}
    </div>
  );
};
export default Landing;

```


# Deployment

The application has been deployed using Heroku cloud on the following urls:

- React App: <https://pre-boot-app.herokuapp.com/login>
- Api: <https://pre-boot-api.herokuapp.com/>


# Log In to Platform

As the platform works by invitation. I leave here a demo user to log in and explore the app.

**User*: guestpreboot@gmail.com
**Password**: 123456


# Local setup

Although it is deployed in production, it can be configured to run in a local environment.

### Prerequisites

1. NodeJS v16.x.
2. Git latest version.
3. A mongodb database that can be created in its own cloud called [Atlas](https://www.mongodb.com/es/cloud/atlas/register).
4. Create account in [Rapid Api](https://rapidapi.com/judge0-official/api/judge0-ce/)
5. Go to [Judge0 CE API](https://rapidapi.com/judge0-official/api/judge0-ce/)

### Starting the project

To do so, the following steps must be performed:

1. Clone the repos

   > git clone <https://github.com/MarcoGarciaKoch/pre-boot-app.git>
   > git clone <https://github.com/MarcoGarciaKoch/pre-boot-api.git>

2. On root folder run install

   > npm i

3. Create local .env files inside the root folder of each repo

   - Inside pre-boot-api `.env` must declare the following environment vars:
     - REACT_APP_MONGOURI: Mongodb connection URL created on prerequisites step 3
     - CORS_ORIGIN=http://localhost:8102
     - FRONT_APP_URL=http://localhost:8100

   - Inside pre-boot-app `.env` must declare the following environment vars:
     - REACT_APP_API_BASE_URL=http://localhost:4000
     - REACT_APP_RAPID_API_HOST=judge0-ce.p.rapidapi.com
     - REACT_APP_RAPID_API_KEY=Copy the X-RapidAPI-Key you´ll find in `Pre-requisites` step 5.
     - REACT_APP_RAPID_API_URL=https://judge0-ce.p.rapidapi.com/submissions

4. Now you can start the app and api running the next commands on each packages separately:

   > npm ionic serve # starts the app (client)
   > npm run start:dev # starts the api (backend)

## Future improvements

There could be many improvements within the application, listed below are the ones that I would prioritize:

- Testing implementation and client unitary test coverage over 80%.
- Implement video call feature using **peerJS**.
- Update all the TypeScript code in the front-end and implement it in the backend.
- Allow pair programming between students in the working area (deciding which library to use).
- Update chat features like the possibility to send files or edit the messages.