import express from "express";
import { getUserInfo, getCourseInfo } from './users.controller.js';

const router = express.Router();

router.get('/info', getUserInfo);
router.get('/courses', getCourseInfo)

export default router;