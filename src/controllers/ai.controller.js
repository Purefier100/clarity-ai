import Memory from "../models/Memory.js";

export const chat = async (req, res) => {
    try {
        const userId = req.user.id;
        const { message } = req.body;

        // Get memory
        let memory = await Memory.findOne({ userId });

        // Detect name
        const nameMatch = message.match(/my name is (\w+)/i);
        if (nameMatch) {
            const name = nameMatch[1];

            if (!memory) {
                memory = await Memory.create({ userId, name });
            } else {
                memory.name = name;
                await memory.save();
            }
        }

        // Build system prompt with memory
        let systemPrompt = "You are Clarity AI.";
        if (memory?.name) {
            systemPrompt += ` The user's name is ${memory.name}.`;
        }

        const reply = await runAI(systemPrompt, message);

        res.json({ success: true, reply });

    } catch (err) {
        console.error("AI ERROR:", err);
        res.status(500).json({
            success: false,
            reply: "AI is temporarily unavailable"
        });
    }
};

