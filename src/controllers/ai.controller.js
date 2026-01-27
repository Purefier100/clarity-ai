import ChatMessage from "../models/ChatMessage.js";
import { generateAIResponse } from "../services/ai.service.js";

export const chat = async (req, res) => {
    try {
        const { sessionId, message } = req.body;

        if (!sessionId || !message || !message.trim()) {
            return res.status(400).json({
                success: false,
                error: "sessionId and message are required"
            });
        }

        // ✅ Save user message
        await ChatMessage.create({
            sessionId,
            role: "user",
            message: message.trim()
        });

        // ✅ Generate AI reply
        const aiReply = await generateAIResponse(message);

        // ✅ Save AI reply
        await ChatMessage.create({
            sessionId,
            role: "assistant",
            message: aiReply
        });

        return res.json({
            success: true,
            reply: aiReply
        });

    } catch (err) {
        console.error("AI CHAT ERROR:", err);
        return res.status(500).json({
            success: false,
            error: err.message
        });
    }
};
