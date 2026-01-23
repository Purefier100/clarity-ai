const API = "https://ai-chat-api-a3wn.onrender.com";

/* ---------- STATE ---------- */
let token = localStorage.getItem("token") || "";

/* ---------- INITIAL PAGE LOAD ---------- */
window.onload = () => {
    if (token) {
        showChat();
    } else {
        showLanding();
    }
};

/* ---------- SCREEN HELPERS ---------- */
function showLanding() {
    hideAll();
    document.getElementById("landing").classList.remove("hidden");
}

function showAuth() {
    hideAll();
    document.getElementById("auth").classList.remove("hidden");
}

function showChat() {
    hideAll();
    document.getElementById("chat").classList.remove("hidden");
}

function hideAll() {
    ["landing", "auth", "chat"].forEach(id =>
        document.getElementById(id).classList.add("hidden")
    );
}

/* ---------- BUTTON BINDINGS ---------- */
document.getElementById("startBtn").onclick = showAuth;
document.getElementById("sendBtn").onclick = sendMessage;

/* ---------- AUTH ---------- */
document.getElementById("registerBtn").onclick = async () => {
    const email = emailInput().value;
    const password = passwordInput().value;

    if (!email || !password) return alert("Email and password required");

    const res = await fetch(`${API}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
    });

    if (!res.ok) return alert("Registration failed");
    alert("Account created. Please login.");
};

document.getElementById("loginBtn").onclick = async () => {
    const email = emailInput().value;
    const password = passwordInput().value;

    if (!email || !password) return alert("Email and password required");

    const res = await fetch(`${API}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
    });

    const data = await res.json();
    if (!data.token) return alert("Login failed");

    token = data.token;
    localStorage.setItem("token", token);
    showChat();
};

function emailInput() {
    return document.getElementById("email");
}
function passwordInput() {
    return document.getElementById("password");
}

/* ---------- CHAT ---------- */
async function sendMessage() {
    if (!token) return alert("Please login first");

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
                sessionId: "prod-user",
                message: text
            })
        });

        const data = await res.json();
        loading.remove();

        if (!res.ok || !data.reply) {
            return typeMessage("ai", "⚠️ AI unavailable. Try again.");
        }

        typeMessage("ai", data.reply);
    } catch {
        loading.remove();
        typeMessage("ai", "⚠️ Network error.");
    }
}

/* ---------- UI ---------- */
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
        bubble.textContent += text[i++] || "";
        if (i >= text.length) clearInterval(interval);
    }, 20);
}

