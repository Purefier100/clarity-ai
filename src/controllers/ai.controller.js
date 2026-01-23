const memoryStore = {}; // TEMP memory (RAM)

export const chatAI = async (req, res) => {
    const { sessionId, message } = req.body;

    if (!sessionId) {
        return res.status(400).json({ error: "sessionId required" });
    }

    // Init memory
    if (!memoryStore[sessionId]) {
        memoryStore[sessionId] = [];
    }

    // Save user message
    memoryStore[sessionId].push({ role: "user", content: message });

    // Build prompt with memory
    const prompt = memoryStore[sessionId]
        .map(m => `${m.role}: ${m.content}`)
        .join("\n");

    const reply = await generateAIReply(prompt);

    // Save AI reply
    memoryStore[sessionId].push({ role: "assistant", content: reply });

    res.json({ reply });
};

