import express from "express";
import { chatAI } from "../controllers/ai.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/chat", protect, chatAI);

export default router;
