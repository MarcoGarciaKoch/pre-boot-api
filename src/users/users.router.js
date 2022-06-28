import express from "express";
import { getUserInfo, updateCurrentLesson } from './users.controller.js';


const router = express.Router();

router.get('/info', getUserInfo);
router.patch('/nextLesson', updateCurrentLesson)

export default router;