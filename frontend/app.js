const API = "https://ai-chat-api-a3wn.onrender.com";

/* ---------- STATE ---------- */
let token = localStorage.getItem("token");

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
    } catch {
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

    let text = messageInput.value;
    if (!text || !text.trim()) return;

    text = text.trim(); // GUARANTEED NON-EMPTY

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
                content: text,      // ✅ REQUIRED
                message: text       // ✅ BACKWARD COMPATIBILITY
            })
        });

        const data = await res.json();
        loading.remove();

        if (!res.ok || !data.reply) {
            console.error("AI backend error:", data);
            addMessage("⚠️ AI temporarily unavailable.", "ai");
            return;
        }

        addMessage(data.reply, "ai");

    } catch (err) {
        console.error("Network error:", err);
        loading.remove();
        addMessage("⚠️ Network error. Try again.", "ai");
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
    return div;
}
