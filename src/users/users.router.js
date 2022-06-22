import express from "express";
import { getUserInfo } from './users.controller.js';

const router = express.Router();

router.get('/info', getUserInfo);

export default router;