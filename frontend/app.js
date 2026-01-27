// app.js - Improved Frontend JavaScript

const API_BASE = "https://ai-chat-api-a3wn.onrender.com";

const authDiv = document.getElementById("auth");
const chatDiv = document.getElementById("chat");
const messagesDiv = document.getElementById("messages");

const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const messageInput = document.getElementById("messageInput");

// Sidebar elements (safe if missing)
const chatList = document.getElementById("chatList");
const toggleSidebar = document.getElementById("toggleSidebar");
const sidebar = document.getElementById("sidebar");

// Create a unique session ID for this user
let sessionId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

/* ================= HELPERS ================= */

// Display normal messages
function addMessage(sender, text, isError = false) {
    const messageEl = document.createElement("p");
    messageEl.innerHTML = `<b>${sender}:</b> ${text}`;
    if (isError) messageEl.style.color = "red";
    messagesDiv.appendChild(messageEl);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// AI streaming message (typing effect)
function streamText(text) {
    const p = document.createElement("p");
    p.innerHTML = "<b>AI:</b> ";
    messagesDiv.appendChild(p);

    let i = 0;
    const interval = setInterval(() => {
        p.innerHTML += text[i] || "";
        i++;
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
        if (i >= text.length) clearInterval(interval);
    }, 15);
}

// Button loading state
function showLoading(show) {
    const sendBtn = document.getElementById("sendBtn");
    if (!sendBtn) return;

    sendBtn.disabled = show;
    sendBtn.textContent = show ? "Sending..." : "Send";
}

/* ================= CHAT HISTORY ================= */

if (toggleSidebar && sidebar) {
    toggleSidebar.onclick = () => {
        sidebar.classList.toggle("open");
    };
}

function saveChatPreview(text) {
    const chats = JSON.parse(localStorage.getItem("chats") || "[]");
    chats.unshift({
        id: sessionId,
        preview: text.slice(0, 30)
    });
    localStorage.setItem("chats", JSON.stringify(chats));
    renderChats();
}

function renderChats() {
    if (!chatList) return;
    const chats = JSON.parse(localStorage.getItem("chats") || "[]");
    chatList.innerHTML = "";

    chats.forEach(chat => {
        const div = document.createElement("div");
        div.className = "chat-item";
        div.textContent = chat.preview || "New chat";
        div.onclick = () => location.reload(); // simple reset
        chatList.appendChild(div);
    });
}

/* ================= AUTH ================= */

// Register
document.getElementById("registerBtn").onclick = async () => {
    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (!email || !password) return alert("Please enter both email and password");
    if (password.length < 6) return alert("Password must be at least 6 characters long");

    try {
        const res = await fetch(`${API_BASE}/api/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });

        const data = await res.json();
        if (data.success) {
            alert("Registration successful! Please login.");
            emailInput.value = "";
            passwordInput.value = "";
        } else {
            alert(data.error || "Registration failed");
        }
    } catch {
        alert("Network error. Please check your connection.");
    }
};

// Login
document.getElementById("loginBtn").onclick = async () => {
    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (!email || !password) return alert("Please enter both email and password");

    try {
        const res = await fetch(`${API_BASE}/api/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });

        const data = await res.json();

        if (data.success && data.token) {
            localStorage.setItem("token", data.token);
            localStorage.setItem("userEmail", email);

            authDiv.classList.add("hidden");
            chatDiv.classList.remove("hidden");

            messagesDiv.innerHTML = "";
            addMessage("System", `Welcome back, ${email}! Start chatting with the AI.`);
            messageInput.focus();
        } else {
            alert(data.error || "Login failed");
        }
    } catch {
        alert("Network error. Please try again.");
    }
};

/* ================= CHAT ================= */

document.getElementById("sendBtn").onclick = async () => {
    const token = localStorage.getItem("token");
    const message = messageInput.value.trim();

    if (!message) return;
    if (!token) return alert("Please login first");

    try {
        addMessage("You", message);
        saveChatPreview(message);
        messageInput.value = "";
        showLoading(true);

        const res = await fetch(`${API_BASE}/api/ai/chat`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ sessionId, message })
        });

        const data = await res.json();

        if (data.success && data.reply) {
            streamText(data.reply);
        } else {
            addMessage("System", data.error || "Failed to get response", true);
        }
    } catch {
        addMessage("System", "Network error. Please check your connection.", true);
    } finally {
        showLoading(false);
        messageInput.focus();
    }
};

// Enter key
messageInput.addEventListener("keypress", e => {
    if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        document.getElementById("sendBtn").click();
    }
});

/* ================= SESSION ================= */

function logout() {
    localStorage.clear();
    chatDiv.classList.add("hidden");
    authDiv.classList.remove("hidden");
    messagesDiv.innerHTML = "";
}

// Auto login
window.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("token");
    const email = localStorage.getItem("userEmail");

    if (token) {
        authDiv.classList.add("hidden");
        chatDiv.classList.remove("hidden");
        addMessage("System", `Welcome back, ${email || "User"}! Continue your conversation.`);
    } else {
        addMessage("System", "Ask me anything to get started 👋");
    }

    renderChats();
});

// Loading screen cleanup
window.onload = () => {
    const loader = document.getElementById("loadingScreen");
    if (loader) loader.style.display = "none";
};
