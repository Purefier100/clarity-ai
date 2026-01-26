import express from "express";
import { chat } from "../controllers/ai.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/chat", authMiddleware, chat);

export default router;
