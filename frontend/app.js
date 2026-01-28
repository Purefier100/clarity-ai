const API_BASE = "https://ai-chat-api-a3wn.onrender.com";

const authDiv = document.getElementById("auth");
const chatDiv = document.getElementById("chat");
const messagesDiv = document.getElementById("messages");

const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");

const chatList = document.getElementById("chatList");
const toggleSidebar = document.getElementById("toggleSidebar");
const sidebar = document.getElementById("sidebar");
const logoutBtn = document.getElementById("logoutBtn");

let sessionId = `user-${Date.now()}-${Math.random().toString(36).slice(2)}`;

/* ================= HELPERS ================= */

function addMessage(sender, text, isError = false) {
    const p = document.createElement("p");
    p.innerHTML = `<b>${sender}:</b> ${text}`;
    if (isError) p.style.color = "red";
    messagesDiv.appendChild(p);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function streamText(text) {
    const p = document.createElement("p");
    messagesDiv.appendChild(p);

    let i = 0;
    const interval = setInterval(() => {
        p.innerHTML = `<b>AI:</b> ${text.slice(0, i)}`;
        i++;
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
        if (i > text.length) clearInterval(interval);
    }, 15);
}

function showLoading(show) {
    sendBtn.disabled = show;
    sendBtn.textContent = show ? "Sending..." : "Send";
}

/* ================= CHAT HISTORY ================= */

function saveChatPreview(text) {
    const chats = JSON.parse(localStorage.getItem("chats") || "[]");
    chats.unshift({ id: sessionId, preview: text.slice(0, 30) });
    localStorage.setItem("chats", JSON.stringify(chats));
    renderChats();
}

function renderChats() {
    chatList.innerHTML = "";
    const chats = JSON.parse(localStorage.getItem("chats") || "[]");

    chats.forEach(chat => {
        const row = document.createElement("div");
        row.className = "chat-item";
        row.innerHTML = `
            <span>${chat.preview}</span>
            <button class="delete-chat">✕</button>
        `;

        row.onclick = () => location.reload();

        row.querySelector(".delete-chat").onclick = (e) => {
            e.stopPropagation();
            const updated = chats.filter(c => c.id !== chat.id);
            localStorage.setItem("chats", JSON.stringify(updated));
            renderChats();
        };

        chatList.appendChild(row);
    });
}

/* ================= AUTH ================= */

document.getElementById("registerBtn").onclick = async () => {
    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (!email || password.length < 6) return alert("Invalid credentials");

    const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
    });

    const data = await res.json();
    if (data.success) alert("Registered! Please login.");
};

document.getElementById("loginBtn").onclick = async () => {
    const email = emailInput.value.trim();
    const password = passwordInput.value;

    const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (data.success) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("userEmail", email);

        authDiv.classList.add("hidden");
        chatDiv.classList.remove("hidden");
        document.body.classList.add("logged-in");
        sendBtn.disabled = false;

        messagesDiv.innerHTML = "";
        addMessage("System", `Welcome back, ${email}!`);
    }
};

/* ================= CHAT ================= */

sendBtn.onclick = async () => {
    const token = localStorage.getItem("token");
    const message = messageInput.value.trim();
    if (!token || !message) return;

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
    if (data.success) streamText(data.reply);
    showLoading(false);
};

messageInput.addEventListener("keydown", e => {
    if (e.key === "Enter") {
        e.preventDefault();
        sendBtn.click();
    }
});

/* ================= LOGOUT ================= */

logoutBtn.onclick = () => {
    localStorage.clear();
    location.reload();
};

/* ================= INIT ================= */

window.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("token");
    const email = localStorage.getItem("userEmail");

    if (token) {
        authDiv.classList.add("hidden");
        chatDiv.classList.remove("hidden");
        document.body.classList.add("logged-in");
        sendBtn.disabled = false;
        addMessage("System", `Welcome back, ${email}`);
    } else {
        sendBtn.disabled = true;
    }

    renderChats();
});

toggleSidebar.onclick = () => {
    sidebar.classList.toggle("open");
    document.body.classList.toggle("sidebar-open");
};

