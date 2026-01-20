const API = "https://ai-chat-api-a3wn.onrender.com";

let token = "";

/* ---------- PAGE SWITCHING ---------- */
function showAuth() {
    document.getElementById("landing").classList.add("hidden");
    document.getElementById("auth").classList.remove("hidden");
}

/* ---------- AUTH ---------- */
document.getElementById("registerBtn").onclick = async () => {
    const email = email.value;
    const password = password.value;

    await fetch(`${API}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
    });

    alert("Account created. Please login.");
};

document.getElementById("loginBtn").onclick = async () => {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const res = await fetch(`${API}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
    });

    const data = await res.json();
    token = data.token;

    document.getElementById("auth").classList.add("hidden");
    document.getElementById("chat").classList.remove("hidden");
};

/* ---------- CHAT ---------- */
async function sendMessage() {
    const input = document.getElementById("messageInput");
    const text = input.value.trim();
    if (!text) return;

    input.value = "";

    addMessage("user", text);

    const loading = addMessage("ai", "Thinking…", true);

    const res = await fetch(`${API}/api/ai/chat`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
            sessionId: "prod-user",
            message: text
        })
    });

    const data = await res.json();

    loading.remove();
    typeMessage("ai", data.reply);
}

/* ---------- UI HELPERS ---------- */
function addMessage(role, text, loading = false) {
    const messages = document.getElementById("messages");

    const msg = document.createElement("div");
    msg.className = `message ${role}`;

    msg.innerHTML = `
    <div class="avatar">${role === "ai" ? "🤖" : "🧑"}</div>
    <div class="bubble">${text}</div>
  `;

    if (loading) msg.classList.add("loading");

    messages.appendChild(msg);
    messages.scrollTop = messages.scrollHeight;

    return msg;
}

function typeMessage(role, text) {
    const msg = addMessage(role, "");
    const bubble = msg.querySelector(".bubble");

    let i = 0;
    const interval = setInterval(() => {
        bubble.textContent += text[i];
        i++;
        if (i >= text.length) clearInterval(interval);
    }, 20);
}

