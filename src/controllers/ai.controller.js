import ChatMessage from "../models/ChatMessage.js";
import { generateAIResponse } from "../services/ai.service.js";

export const chat = async (req, res) => {
    try {
        const { sessionId, content } = req.body;

        if (!sessionId || !content || !content.trim()) {
            return res.status(400).json({
                success: false,
                error: "sessionId and content are required",
            });
        }

        // ✅ Save USER message
        await ChatMessage.create({
            sessionId,
            role: "user",
            content: content.trim(),
        });

        // ✅ Generate AI reply
        const aiReply = await generateAIResponse(content.trim());

        // ✅ Save AI reply
        await ChatMessage.create({
            sessionId,
            role: "assistant",
            content: aiReply,
        });

        return res.json({
            success: true,
            reply: aiReply,
        });

    } catch (err) {
        console.error("AI CHAT ERROR:", err);
        return res.status(500).json({
            success: false,
            error: err.message,
        });
    }
};
