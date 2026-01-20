// Simple in-memory store (resets when server restarts)
const chatStore = new Map();

export function getChat(sessionId) {
    if (!chatStore.has(sessionId)) {
        chatStore.set(sessionId, []);
    }
    return chatStore.get(sessionId);
}

export function addMessage(sessionId, role, content) {
    const chat = getChat(sessionId);
    chat.push({ role, content });

    // Optional: limit memory size (last 10 messages)
    if (chat.length > 10) {
        chat.shift();
    }
}
