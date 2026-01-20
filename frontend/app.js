alert("app.js loaded");

const API_BASE = "https://ai-chat-api-a3wn.onrender.com";

const authDiv = document.getElementById("auth");
const chatDiv = document.getElementById("chat");
const messagesDiv = document.getElementById("messages");

const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const messageInput = document.getElementById("messageInput");

document.getElementById("registerBtn").onclick = async () => {
    const email = emailInput.value;
    const password = passwordInput.value;

    const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
    });

    const data = await res.json();
    alert(data.message || "Registered");
};

document.getElementById("loginBtn").onclick = async () => {
    const email = emailInput.value;
    const password = passwordInput.value;

    const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (data.token) {
        localStorage.setItem("token", data.token);
        authDiv.classList.add("hidden");
        chatDiv.classList.remove("hidden");
    } else {
        alert("Login failed");
    }
};

document.getElementById("sendBtn").onclick = async () => {
    const token = localStorage.getItem("token");
    const message = messageInput.value;

    const res = await fetch(`${API_BASE}/api/ai/chat`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
            sessionId: "frontend-user",
            message
        })
    });

    const data = await res.json();
    messagesDiv.innerHTML += `<p><b>You:</b> ${message}</p>`;
    messagesDiv.innerHTML += `<p><b>AI:</b> ${data.reply}</p>`;
    messageInput.value = "";
};
