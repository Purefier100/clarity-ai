document.addEventListener("DOMContentLoaded", () => {
    console.log("✅ DOM loaded");

    const API = "https://ai-chat-api-a3wn.onrender.com";

    const loginBtn = document.getElementById("loginBtn");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");

    const chat = document.getElementById("chat");
    const sendBtn = document.getElementById("sendBtn");
    const messageInput = document.getElementById("messageInput");
    const messages = document.getElementById("messages");

    let token = localStorage.getItem("token");

    /* ---------- LOGIN ---------- */
    loginBtn.addEventListener("click", async () => {
        console.log("🔥 LOGIN CLICKED");

        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();

        if (!email || !password) {
            alert("Email & password required");
            return;
        }

        try {
            const res = await fetch(`${API}/api/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            });

            const data = await res.json();
            console.log("LOGIN RESPONSE:", data);

            if (!res.ok || !data.token) {
                alert(data.error || "Login failed");
                return;
            }

            token = data.token;
            localStorage.setItem("token", token);

            alert("Login success 🎉");
            chat.style.display = "block";

        } catch (err) {
            console.error("FETCH ERROR:", err);
            alert("Network error — check console");
        }
    });

    /* ---------- CHAT ---------- */
    sendBtn.addEventListener("click", async () => {
        if (!token) return alert("Login first");

        const text = messageInput.value.trim();
        if (!text) return;

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
            messages.innerHTML += `<p>${data.reply || "AI error"}</p>`;
            messageInput.value = "";

        } catch (err) {
            console.error(err);
            alert("Chat error");
        }
    });
});
