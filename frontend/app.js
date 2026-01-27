const API = "https://ai-chat-api-a3wn.onrender.com";
let token = localStorage.getItem("token") || "";

/* ---------- CHAT ---------- */
async function sendMessage() {
    if (!token) {
        addMessage("ai", "⚠️ Please login first.");
        return;
    }

    const input = document.getElementById("messageInput");
    const text = input.value.trim();
    if (!text) return;

    input.value = "";
    addMessage("user", text);

    const loading = addMessage("ai", "Thinking…", true);

    try {
        const res = await fetch(`${API}/api/ai/chat`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                sessionId: "clarity-session",
                content: text   // ✅ THIS MUST MATCH SCHEMA
            })
        });

        const data = await res.json();
        loading.remove();

        if (!res.ok || !data.reply) {
            addMessage("ai", "⚠️ AI unavailable.");
            return;
        }

        addMessage("ai", data.reply);

    } catch (err) {
        loading.remove();
        addMessage("ai", "⚠️ Network error.");
    }
}

/* ---------- UI ---------- */
function addMessage(role, text, loading = false) {
    const messages = document.getElementById("messages");
    const div = document.createElement("div");
    div.className = `message ${role}`;
    if (loading) div.classList.add("loading");
    div.textContent = text;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
    return div;
}

document.getElementById("sendBtn").addEventListener("click", sendMessage);

