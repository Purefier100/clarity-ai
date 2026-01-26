import ChatMessage from "../models/ChatMessage.js";
import { generateAIResponse } from "../services/ai.service.js"; // ✅ make sure this exists

export const chat = async (req, res) => {
    try {
        const { sessionId, message, content } = req.body;

        // ✅ normalize input
        const text = (message || content || "").trim();

        if (!sessionId || !text) {
            return res.status(400).json({
                success: false,
                error: "sessionId and content/message are required"
            });
        }

        // ✅ save USER message
        await ChatMessage.create({
            sessionId,
            role: "user",
            content: text
        });

        // ✅ generate AI reply
        const aiReply = await generateAIResponse(text);

        if (!aiReply) {
            throw new Error("AI returned empty response");
        }

        // ✅ save AI message
        await ChatMessage.create({
            sessionId,
            role: "assistant",
            content: aiReply
        });

        return res.status(200).json({
            success: true,
            reply: aiReply
        });

    } catch (err) {
        console.error("AI CHAT ERROR:", err);

        return res.status(500).json({
            success: false,
            error: err.message || "Internal server error"
        });
    }
};


