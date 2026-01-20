import Groq from "groq-sdk";

export const generateText = async (req, res) => {
    try {
        const { prompt } = req.body;

        if (!prompt) {
            return res.status(400).json({ error: "Prompt is required" });
        }

        const groq = new Groq({
            apiKey: process.env.GROQ_API_KEY,
        });

        const completion = await groq.chat.completions.create({
            model: process.env.GROQ_MODEL,
            messages: [
                { role: "system", content: "You are a helpful assistant." },
                { role: "user", content: prompt },
            ],
        });

        res.json({
            success: true,
            response: completion.choices[0].message.content,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
};
