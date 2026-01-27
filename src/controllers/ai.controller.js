// controllers/ai.controller.js
import ChatMessage from "../models/ChatMessage.js";
import { generateAIResponse } from "../services/ai.service.js";

export const chat = async (req, res) => {
    try {
        const { sessionId, message } = req.body;

        // Validation
        if (!sessionId || !message || !message.trim()) {
            return res.status(400).json({
                success: false,
                error: "sessionId and message are required"
            });
        }

        if (message.length > 5000) {
            return res.status(400).json({
                success: false,
                error: "Message is too long. Maximum 5000 characters."
            });
        }

        console.log(`[CHAT] Session: ${sessionId} | User: ${message.substring(0, 50)}...`);

        // Save user message
        try {
            await ChatMessage.create({
                sessionId,
                role: "user",
                message: message.trim()
            });
        } catch (dbError) {
            console.error("Database error saving user message:", dbError);
            // Continue even if DB save fails
        }

        // Generate AI reply
        let aiReply;
        try {
            aiReply = await generateAIResponse(message.trim());
            console.log(`[CHAT] AI reply: ${aiReply.substring(0, 50)}...`);
        } catch (aiError) {
            console.error("AI generation error:", aiError);
            return res.status(500).json({
                success: false,
                error: "Failed to generate AI response. Please try again."
            });
        }

        // Save AI reply
        try {
            await ChatMessage.create({
                sessionId,
                role: "assistant",
                message: aiReply
            });
        } catch (dbError) {
            console.error("Database error saving AI message:", dbError);
            // Continue - user still gets response
        }

        return res.json({
            success: true,
            reply: aiReply
        });

    } catch (err) {
        console.error("AI CHAT ERROR:", err.message);
        console.error("Stack trace:", err.stack);
        return res.status(500).json({
            success: false,
            error: `Server error: ${err.message}`
        });
    }
};

export const getChatHistory = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const limit = parseInt(req.query.limit) || 50;

        if (!sessionId) {
            return res.status(400).json({
                success: false,
                error: "sessionId is required"
            });
        }

        const messages = await ChatMessage.find({ sessionId })
            .sort({ createdAt: 1 })
            .limit(limit)
            .select('-__v');

        return res.json({
            success: true,
            count: messages.length,
            messages
        });

    } catch (err) {
        console.error("GET HISTORY ERROR:", err);
        return res.status(500).json({
            success: false,
            error: err.message
        });
    }
};