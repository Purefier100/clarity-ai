import Memory from "../models/Memory.js";

export const chatAI = async (req, res) => {
    try {
        const { message } = req.body;
        const userId = req.user.id;

        let memory = await Memory.findOne({ userId });
        if (!memory) memory = await Memory.create({ userId });

        // Detect name
        const nameMatch = message.match(/my name is ([a-zA-Z]+)/i);
        if (nameMatch) {
            memory.name = nameMatch[1];
            await memory.save();

            return res.json({
                success: true,
                reply: `Nice to meet you, ${memory.name}. I’ll remember your name.`
            });
        }

        // Recall name
        if (/what is my name/i.test(message)) {
            return res.json({
                success: true,
                reply: memory.name
                    ? `Your name is ${memory.name}.`
                    : "You haven't told me your name yet."
            });
        }

        // Default response
        res.json({
            success: true,
            reply: memory.name
                ? `How can I help you today, ${memory.name}?`
                : "How can I help you today?"
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: "AI error" });
    }
};


