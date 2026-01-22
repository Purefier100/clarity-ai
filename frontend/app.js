const API = "https://ai-chat-api-a3wn.onrender.com";

/* ---------- TOKEN ---------- */
let token = localStorage.getItem("token") || "";

/* ---------- AUTH ---------- */
document.getElementById("registerBtn").onclick = async () => {
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
};

document.getElementById("loginBtn").onclick = async () => {
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
        alert("Login failed");
        return;
    }

    token = data.token;
    localStorage.setItem("token", token);

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
            typeMessage("ai", "⚠️ AI is currently unavailable. Try again.");
            return;
        }

        typeMessage("ai", data.reply);
    } catch (err) {
        loading.remove();
        typeMessage("ai", "⚠️ Network error. Please try again.");
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

