const API = "https://ai-chat-api-a3wn.onrender.com";

let token = localStorage.getItem("token");
let isSending = false;

const sendBtn = document.getElementById("sendBtn");
const messageInput = document.getElementById("messageInput");
const messages = document.getElementById("messages");

sendBtn.onclick = sendMessage;

async function sendMessage() {
    if (!token) {
        addMessage("⚠️ Please login first.", "ai");
        return;
    }

    if (isSending) return;
    isSending = true;

    const text = messageInput.value.trim();
    if (!text) {
        isSending = false;
        return;
    }

    messageInput.value = "";
    addMessage(text, "user");
    const loading = addMessage("Thinking…", "ai", true);

    try {
        const res = await fetch(`${API}/api/ai/chat`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                sessionId: "clarity",
                message: text
            })
        });

        const data = await res.json();
        loading.remove();
        isSending = false;

        if (!res.ok || !data.reply) {
            console.error("Backend error:", data);
            addMessage("⚠️ AI unavailable.", "ai");
            return;
        }

        addMessage(data.reply, "ai");

    } catch (err) {
        console.error(err);
        loading.remove();
        isSending = false;
        addMessage("⚠️ Network error.", "ai");
    }
}

function addMessage(text, role, loading = false) {
    const div = document.createElement("div");
    div.className = `message ${role}`;
    if (loading) div.classList.add("loading");
    div.textContent = text;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
    return div;
}
