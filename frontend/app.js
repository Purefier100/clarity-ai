document.addEventListener("DOMContentLoaded", () => {
    const API = "https://ai-chat-api-a3wn.onrender.com";

    let token = localStorage.getItem("token");
    let isSending = false;

    const loginBtn = document.getElementById("loginBtn");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const sendBtn = document.getElementById("sendBtn");
    const messageInput = document.getElementById("messageInput");
    const messages = document.getElementById("messages");
    const authOverlay = document.getElementById("authOverlay");

    // ---------- LOGIN ----------
    loginBtn.addEventListener("click", async (e) => {
        e.preventDefault();

        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();

        const res = await fetch(`${API}/api/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });

        const data = await res.json();

        if (!res.ok || !data.token) {
            alert("Login failed");
            return;
        }

        token = data.token;
        localStorage.setItem("token", token);

        authOverlay.style.display = "none";
    });

    // ---------- CHAT ----------
    sendBtn.addEventListener("click", async () => {
        if (!token || isSending) return;

        const text = messageInput.value.trim();
        if (!text) return;

        isSending = true;
        messageInput.value = "";

        addMessage(text, "user");
        const loading = addMessage("Thinking…", "ai");

        try {
            const res = await fetch(`${API}/api/ai/chat`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    sessionId: "clarity",
                    content: text, // ✅ ONLY FIELD
                }),
            });

            const data = await res.json();
            loading.remove();
            isSending = false;

            if (!res.ok || !data.reply) {
                addMessage("⚠️ AI error", "ai");
                return;
            }

            addMessage(data.reply, "ai");

        } catch (err) {
            loading.remove();
            isSending = false;
            addMessage("⚠️ Network error", "ai");
        }
    });

    function addMessage(text, role) {
        const div = document.createElement("div");
        div.className = `message ${role}`;
        div.textContent = text;
        messages.appendChild(div);
        messages.scrollTop = messages.scrollHeight;
        return div;
    }
});

