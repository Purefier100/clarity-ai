import Groq from "groq-sdk";
import ChatMessage from "../models/ChatMessage.js";

export const chatWithMemory = async (req, res) => {
    try {
        const { sessionId, message } = req.body;

        if (!sessionId || !message) {
            return res.status(400).json({ error: "sessionId and message required" });
        }

        const groq = new Groq({
            apiKey: process.env.GROQ_API_KEY,
        });

        // Save user message
        await ChatMessage.create({
            sessionId,
            role: "user",
            content: message,
        });

        // Fetch last 10 messages
        const history = await ChatMessage.find({ sessionId })
            .sort({ createdAt: 1 })
            .limit(10);

        const completion = await groq.chat.completions.create({
            model: process.env.GROQ_MODEL,
            messages: [
                { role: "system", content: "You are a helpful assistant." },
                ...history.map(m => ({
                    role: m.role,
                    content: m.content,
                })),
            ],
        });

        const reply = completion.choices[0].message.content;

        // Save AI reply
        await ChatMessage.create({
            sessionId,
            role: "assistant",
            content: reply,
        });

        res.json({
            success: true,
            reply,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
};
