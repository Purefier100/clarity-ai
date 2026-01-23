const API = "https://ai-chat-api-a3wn.onrender.com";

let token = localStorage.getItem("token");
let userName = localStorage.getItem("userName") || null;

/* ---------- UI ---------- */
const auth = document.getElementById("auth");
const chat = document.getElementById("chat");
const messages = document.getElementById("messages");

if (token) {
    auth.classList.add("hidden");
    chat.classList.remove("hidden");
}

/* ---------- LOGIN ---------- */
document.getElementById("loginBtn").onclick = async () => {
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    const res = await fetch(`${API}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
    });

    const data = await res.json();
    if (!data.token) return alert("Login failed");

    token = data.token;
    localStorage.setItem("token", token);

    auth.classList.add("hidden");
    chat.classList.remove("hidden");
};

/* ---------- CHAT ---------- */
document.getElementById("sendBtn").onclick = sendMessage;

async function sendMessage() {
    const input = messageInput;
    const text = input.value.trim();
    if (!text) return;

    input.value = "";
    add("user", text);

    const match = text.match(/my name is\s+(\w+)/i);
    if (match) {
        userName = match[1];
        localStorage.setItem("userName", userName);
    }

    add("ai", "Thinking…");

    try {
        const res = await fetch(`${API}/api/ai/chat`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                sessionId: "clarity-main",
                message: `User name: ${userName || "unknown"}\nUser says: ${text}`
            })
        });

        const data = await res.json();
        messages.lastChild.remove();

        add("ai", data.reply || "AI unavailable. Try again.");
    } catch {
        messages.lastChild.remove();
        add("ai", "Server waking up. Try again.");
    }
}

/* ---------- HELPERS ---------- */
function add(role, text) {
    const div = document.createElement("div");
    div.className = `message ${role}`;
    div.innerHTML = `<div class="bubble">${text}</div>`;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
}
