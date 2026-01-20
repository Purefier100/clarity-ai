import express from "express";
import { generateText } from "../controllers/ai.controller.js";

const router = express.Router();

router.post("/generate", generateText);

export default router;
