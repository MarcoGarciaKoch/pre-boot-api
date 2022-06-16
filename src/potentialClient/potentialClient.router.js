import express from "express";
import { validatePotentialClient } from "./potentialClient.middleware.js";
import { registerPotentialClient } from "./potentialClient.controller.js";


const router = express.Router();


// endpoint for potential client register
router.post('/moreInfo', validatePotentialClient, registerPotentialClient);


export default router;