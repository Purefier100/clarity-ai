import Memory from "../models/Memory.js";

export const chatAI = async (req, res) => {
    try {
        const { message, sessionId } = req.body;
        const userId = req.user.id;

        // 1️⃣ Find or create memory
        let memory = await Memory.findOne({ userId });
        if (!memory) {
            memory = await Memory.create({ userId });
        }

        // 2️⃣ Detect name
        const match = message.match(/my name is (\w+)/i);
        if (match) {
            memory.name = match[1];
            await memory.save();
        }

        // 3️⃣ If user asks for name
        if (/what is my name/i.test(message)) {
            if (memory.name) {
                return res.json({
                    success: true,
                    reply: `Your name is ${memory.name}.`
                });
            } else {
                return res.json({
                    success: true,
                    reply: "You haven't told me your name yet."
                });
            }
        }

        // 4️⃣ Normal AI response
        const reply = `Hello${memory.name ? " " + memory.name : ""}. How can I help you today?`;

        res.json({ success: true, reply });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: "AI error" });
    }
};

