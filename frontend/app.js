const API = "https://ai-chat-api-a3wn.onrender.com";

/* ---------- STATE ---------- */
let token = localStorage.getItem("token");
let userName = localStorage.getItem("userName") || null;

/* ---------- ELEMENTS ---------- */
const authOverlay = document.getElementById("authOverlay");
const loginBtn = document.getElementById("loginBtn");
const registerBtn = document.getElementById("registerBtn");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const sendBtn = document.getElementById("sendBtn");
const messageInput = document.getElementById("messageInput");
const messages = document.getElementById("messages");

/* ---------- AUTH ---------- */
loginBtn.onclick = async () => {
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

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
        authOverlay.style.display = "none";
    } catch (err) {
        alert("Network error during login");
    }
};

registerBtn.onclick = async () => {
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    if (!email || !password) {
        alert("Email and password required");
        return;
    }

    try {
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
    } catch {
        alert("Network error during registration");
    }
};

/* ---------- CHAT ---------- */
sendBtn.onclick = sendMessage;

async function sendMessage() {
    if (!token) {
        addMessage("⚠️ Please login first.", "ai");
        return;
    }

    const text = messageInput.value.trim();
    if (!text) return;

    messageInput.value = "";
    addMessage(text, "user");
    addMessage("Thinking…", "ai", true);

    try {
        const res = await fetch(`${API}/api/ai/chat`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                sessionId: "clarity",
                content: text   // ✅ FIX IS HERE
            })
        });

        const data = await res.json();
        removeLoading();

        if (!res.ok || !data.reply) {
            console.error(data);
            addMessage("⚠️ AI temporarily unavailable.", "ai");
            return;
        }

        addMessage(data.reply, "ai");

    } catch (err) {
        console.error(err);
        removeLoading();
        addMessage("⚠️ Network error.", "ai");
    }
}


/* ---------- UI HELPERS ---------- */
function addMessage(text, role, loading = false) {
    const div = document.createElement("div");
    div.className = `message ${role}`;
    if (loading) div.classList.add("loading");
    div.textContent = text;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
}

function removeLoading() {
    const loading = document.querySelector(".message.loading");
    if (loading) loading.remove();
}
