import express from "express";
import { validateEarlyStudent } from "./early.middleware.js";
import { registerEarlyStudent, getCourses } from "./early.controller.js";


const router = express.Router();

router.get('/get-courses', getCourses);
// endpoint for potential client register
router.post('/register-student', validateEarlyStudent, registerEarlyStudent);


export default router;