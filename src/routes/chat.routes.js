import express from "express";
import { chatWithMemory } from "../controllers/chat.controller.js";

const router = express.Router();

router.post("/chat", chatWithMemory);

export default router;
