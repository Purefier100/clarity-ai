const API = "https://ai-chat-api-a3wn.onrender.com";

/* ---------- STATE ---------- */
let token = localStorage.getItem("token") || "";
let isLogin = true;

/* ---------- DOM ELEMENTS ---------- */
const authOverlay = document.getElementById("authOverlay");
const authTitle = document.getElementById("authTitle");
const toggleText = document.getElementById("toggleText");
const toggleBtn = document.getElementById("toggleAuth");

const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");

const loginBtn = document.getElementById("loginBtn");
const registerBtn = document.getElementById("registerBtn");

const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");
const messages = document.getElementById("messages");

/* ---------- AUTO SHOW CHAT IF LOGGED IN ---------- */
if (token) {
    authOverlay.style.display = "none";
}

/* ---------- TOGGLE LOGIN / REGISTER ---------- */
toggleBtn.onclick = () => {
    isLogin = !isLogin;

    loginBtn.classList.toggle("hidden", !isLogin);
    registerBtn.classList.toggle("hidden", isLogin);

    authTitle.textContent = isLogin
        ? "Login to continue"
        : "Create an account";

    toggleText.textContent = isLogin
        ? "Don’t have an account?"
        : "Already have an account?";

    toggleBtn.textContent = isLogin ? "Register" : "Login";
};

/* ---------- LOGIN ---------- */
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
        console.error(err);
        alert("Network error");
    }
};

/* ---------- REGISTER ---------- */
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
        toggleBtn.click();
    } catch (err) {
        console.error(err);
        alert("Network error");
    }
};

/* ---------- CHAT ---------- */
sendBtn.onclick = async () => {
    const text = messageInput.value.trim();
    if (!text) return;

    messageInput.value = "";
    addMessage(text, "user");

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
        addMessage(data.reply || "⚠️ AI error", "ai");
    } catch (err) {
        console.error(err);
        addMessage("⚠️ Network error", "ai");
    }
};

/* ---------- UI HELPERS ---------- */
function addMessage(text, role) {
    const div = document.createElement("div");
    div.className = `message ${role}`;
    div.textContent = text;

    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
}
