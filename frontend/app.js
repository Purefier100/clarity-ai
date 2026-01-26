document.addEventListener("DOMContentLoaded", () => {

    const API = "https://ai-chat-api-a3wn.onrender.com";

    let token = localStorage.getItem("token");
    let isSending = false;
    let isLogin = true;

    const authOverlay = document.getElementById("authOverlay");
    const loginBtn = document.getElementById("loginBtn");
    const registerBtn = document.getElementById("registerBtn");
    const toggleBtn = document.getElementById("toggleAuth");
    const toggleText = document.getElementById("toggleText");
    const authTitle = document.getElementById("authTitle");

    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");

    const chat = document.getElementById("chat");
    const sendBtn = document.getElementById("sendBtn");
    const messageInput = document.getElementById("messageInput");
    const messages = document.getElementById("messages");

    /* ---------- TOGGLE LOGIN / REGISTER ---------- */
    toggleBtn.onclick = () => {
        isLogin = !isLogin;

        loginBtn.classList.toggle("hidden", !isLogin);
        registerBtn.classList.toggle("hidden", isLogin);

        authTitle.textContent = isLogin ? "Login to continue" : "Create account";
        toggleText.textContent = isLogin
            ? "Don’t have an account?"
            : "Already have an account?";
        toggleBtn.textContent = isLogin ? "Register" : "Login";
    };

    /* ---------- LOGIN ---------- */
    loginBtn.onclick = async () => {
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();

        if (!email || !password) return alert("Email and password required");

        const res = await fetch(`${API}/api/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });

        const data = await res.json();
        if (!res.ok) return alert(data.error || "Login failed");

        localStorage.setItem("token", data.token);
        authOverlay.classList.add("hidden");
        chat.classList.remove("hidden");
    };

    /* ---------- REGISTER ---------- */
    registerBtn.onclick = async () => {
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();

        if (!email || !password) return alert("Email and password required");

        const res = await fetch(`${API}/api/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });

        if (!res.ok) return alert("Registration failed");
        alert("Account created. Please login.");
        toggleBtn.click();
    };

    /* ---------- CHAT ---------- */
    sendBtn.onclick = async () => {
        if (!token) return;

        if (isSending) return;
        isSending = true;

        const text = messageInput.value.trim();
        if (!text) return isSending = false;

        messageInput.value = "";
        addMessage(text, "user");
        addMessage("Thinking…", "ai");

        const res = await fetch(`${API}/api/ai/chat`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`
            },
            body: JSON.stringify({ sessionId: "clarity", message: text })
        });

        const data = await res.json();
        isSending = false;

        if (!res.ok) return addMessage("AI unavailable", "ai");
        addMessage(data.reply, "ai");
    };

    function addMessage(text, role) {
        const div = document.createElement("div");
        div.className = `message ${role}`;
        div.textContent = text;
        messages.appendChild(div);
        messages.scrollTop = messages.scrollHeight;
    }

});
