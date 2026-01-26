document.addEventListener("DOMContentLoaded", () => {

    const API = "https://ai-chat-api-a3wn.onrender.com";

    /* ---------- STATE ---------- */
    let token = localStorage.getItem("token") || null;
    let isSending = false;

    /* ---------- ELEMENTS ---------- */
    const authOverlay = document.getElementById("authOverlay");
    const loginBtn = document.getElementById("loginBtn");
    const registerBtn = document.getElementById("registerBtn");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const sendBtn = document.getElementById("sendBtn");
    const messageInput = document.getElementById("messageInput");
    const messages = document.getElementById("messages");

    if (!loginBtn || !emailInput || !passwordInput) {
        console.error("Auth elements missing in HTML");
        return;
    }

    /* ---------- AUTH ---------- */
    loginBtn.addEventListener("click", async (e) => {
        e.preventDefault(); // 🔥 IMPORTANT

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

            authOverlay.classList.add("hidden"); // hide login
            document.getElementById("chat").classList.remove("hidden"); // show chat

        } catch (err) {
            console.error(err);
            alert("Network error during login");
        }
    });

    /* ---------- REGISTER ---------- */
    registerBtn?.addEventListener("click", async (e) => {
        e.preventDefault();

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
    });

    /* ---------- CHAT ---------- */
    sendBtn?.addEventListener("click", sendMessage);

    async function sendMessage() {
        if (!token) {
            addMessage("⚠️ Please login first.", "ai");
            return;
        }

        if (isSending) return;
        isSending = true;

        const text = messageInput.value.trim();
        if (!text) {
            isSending = false;
            return;
        }

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
                    message: text
                })
            });

            const data = await res.json();
            loading.remove();
            isSending = false;

            if (!res.ok || !data.reply) {
                addMessage("⚠️ AI unavailable.", "ai");
                return;
            }

            addMessage(data.reply, "ai");

        } catch (err) {
            loading.remove();
            isSending = false;
            addMessage("⚠️ Network error.", "ai");
        }
    }

    function addMessage(text, role, loading = false) {
        const div = document.createElement("div");
        div.className = `message ${role}`;
        if (loading) div.classList.add("loading");
        div.textContent = text;
        messages.appendChild(div);
        messages.scrollTop = messages.scrollHeight;
        return div;
    }

});
