const API = "https://ai-chat-api-a3wn.onrender.com";

/* ---------- STATE ---------- */
let token = localStorage.getItem("token") || "";

/* ---------- MEMORY ---------- */
let memory = {
    name: localStorage.getItem("userName") || null,
    history: []
};

/* ---------- AUTH ---------- */
document.getElementById("loginBtn")?.addEventListener("click", async () => {
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!email || !password) {
        alert("Email and password required");
        return;
    }

    try {
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

        document.getElementById("auth").classList.add("hidden");
        document.getElementById("chat").classList.remove("hidden");

    } catch (err) {
        alert("Network error");
    }
});

document.addEventListener("DOMContentLoaded", () => {
    const getStartedBtn = document.getElementById("getStartedBtn");

    if (getStartedBtn) {
        getStartedBtn.addEventListener("click", showAuth);
    }
});


function showAuth() {
    document.getElementById("landing")?.classList.add("hidden");
    document.getElementById("auth")?.classList.remove("hidden");
}


/* ---------- CHAT ---------- */
document.getElementById("sendBtn")?.addEventListener("click", sendMessage);

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

    /* ---- Save history BEFORE request ---- */
    memory.history.push(`User: ${text}`);

    /* ---- Build strong AI prompt ---- */
    const context = `
You are a helpful AI assistant.

Known user information:
- Name: ${memory.name || "unknown"}

Conversation so far:
${memory.history.join("\n")}

User just said:
"${text}"

If the user asks about their name, answer using the known name.
`;

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
                message: context
            })
        });

        const data = await res.json();
        loading.remove();

        if (!res.ok || !data.reply) {
            addMessage("ai", "⚠️ AI unavailable.");
            return;
        }

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
    if (loading) msg.classList.add("loading");

    msg.innerHTML = `
        <div class="avatar">${role === "ai" ? "🤖" : "🧑"}</div>
        <div class="bubble">${text}</div>
    `;

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
