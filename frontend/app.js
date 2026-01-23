const API = "https://ai-chat-api-a3wn.onrender.com";

let token = localStorage.getItem("token") || "";

const authOverlay = document.getElementById("authOverlay");
const loginBtn = document.getElementById("loginBtn");
const registerBtn = document.getElementById("registerBtn");
const toggleBtn = document.getElementById("toggleAuth");
const toggleText = document.getElementById("toggleText");
const authTitle = document.getElementById("authTitle");
const sendBtn = document.getElementById("sendBtn");

let isLogin = true;

/* ---- Toggle Login/Register ---- */
toggleBtn.onclick = () => {
    isLogin = !isLogin;
    loginBtn.classList.toggle("hidden", !isLogin);
    registerBtn.classList.toggle("hidden", isLogin);

    authTitle.textContent = isLogin ? "Login to continue" : "Create an account";
    toggleText.textContent = isLogin
        ? "Don’t have an account?"
        : "Already have an account?";
    toggleBtn.textContent = isLogin ? "Register" : "Login";
};

/* ---- LOGIN ---- */
loginBtn.onclick = async () => {
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    const res = await fetch(`${API}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
    });

    const data = await res.json();
    if (!data.token) return alert("Login failed");

    localStorage.setItem("token", data.token);
    authOverlay.style.display = "none";
};

/* ---- REGISTER ---- */
registerBtn.onclick = async () => {
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    const res = await fetch(`${API}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
    });

    if (!res.ok) return alert("Registration failed");

    alert("Account created. Please login.");
    toggleBtn.click();
};

/* ---- CHAT ---- */
sendBtn.onclick = async () => {
    const input = messageInput.value.trim();
    if (!input) return;

    messageInput.value = "";
    addMessage(input, "user");

    const res = await fetch(`${API}/api/ai/chat`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({ sessionId: "clarity", message: input })
    });

    const data = await res.json();
    addMessage(data.reply || "AI error", "ai");
};

function addMessage(text, role) {
    const div = document.createElement("div");
    div.className = `message ${role}`;
    div.textContent = text;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
}
