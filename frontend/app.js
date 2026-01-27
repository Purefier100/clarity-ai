const API = "https://ai-chat-api-a3wn.onrender.com";

/* ---------- TOKEN ---------- */
let token = localStorage.getItem("token") || "";

/* ---------- SIMPLE MEMORY ---------- */
let memory = {
    name: localStorage.getItem("userName") || null,
    history: []
};

/* ---------- PAGE SWITCH ---------- */
function showAuth() {
    document.getElementById("landing")?.classList.add("hidden");
    document.getElementById("auth")?.classList.remove("hidden");
}

function showChat() {
    document.getElementById("auth")?.classList.add("hidden");
    document.getElementById("chat")?.classList.remove("hidden");
}

/* ---------- AUTH ---------- */
document.getElementById("registerBtn")?.addEventListener("click", async () => {
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!email || !password) {
        alert("Email and password required");
        return;
    }

    const res = await fetch(`${API}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
    });

    if (!res.ok) {
        alert("Registration failed");
        return;
    }

    alert("Account created. Please login.");
});

document.getElementById("loginBtn")?.addEventListener("click", async () => {
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!email || !password) {
        alert("Email and password required");
        return;
    }

    const res = await fetch(`${API}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (!res.ok || !data.token) {
        alert(data.error || "Login failed");
        return;
    }

    token = data.token;
    localStorage.setItem("token", token);

    showChat();
});

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

    /* ---- Detect name ---- */
    const nameMatch = text.match(/my name is\s+([a-zA-Z]+)/i);
    if (nameMatch) {
        memory.name = nameMatch[1];
        localStorage.setItem("userName", memory.name);
    }

    const loading = addMessage("ai", "Thinking…", true);

    /* ---- Build context ---- */
    const context = `
User name: ${memory.name || "unknown"}
Conversation history:
${memory.history.join("\n")}
User says: ${text}
`;

    try {
        const res = await fetch(`${API}/api/ai/chat`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                sessionId: "clarity-session", // ✅ FIXED session
                message: context
            })
        });

        const data = await res.json();
        loading.remove();

        if (!res.ok || !data.reply) {
            addMessage("ai", "⚠️ AI unavailable. Try again.");
            return;
        }

        memory.history.push(`User: ${text}`);
        memory.history.push(`AI: ${data.reply}`);

        typeMessage("ai", data.reply);
    } catch (err) {
        loading.remove();
        addMessage("ai", "⚠️ Network error.");
    }
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
        bubble.textContent += text[i] || "";
        i++;
        if (i >= text.length) clearInterval(interval);
    }, 20);
}

