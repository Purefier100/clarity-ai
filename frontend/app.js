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
const newChatBtn = document.getElementById("newChat");

/* ================= STORAGE ================= */

function getChats() {
    return JSON.parse(localStorage.getItem("chats") || "[]");
}

function saveChats(chats) {
    localStorage.setItem("chats", JSON.stringify(chats));
}

function createNewChatId() {
    const id = `chat-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    localStorage.setItem("activeChatId", id);
    return id;
}

let sessionId = localStorage.getItem("activeChatId") || createNewChatId();

/* ================= CHAT HELPERS ================= */

function ensureChatExists() {
    const chats = getChats();
    let chat = chats.find(c => c.id === sessionId);

    if (!chat) {
        chat = {
            id: sessionId,
            messages: [],
            updatedAt: Date.now()
        };
        chats.unshift(chat);
        saveChats(chats);
    }
}

function getCurrentChat() {
    return getChats().find(c => c.id === sessionId);
}

/* ================= UI HELPERS ================= */

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

/* ================= SIDEBAR ================= */

function renderChats() {
    chatList.innerHTML = "";
    const chats = getChats().sort((a, b) => b.updatedAt - a.updatedAt);

    chats.forEach(chat => {
        const lastMsg = chat.messages.at(-1)?.text || "New chat";

        const row = document.createElement("div");
        row.className = "chat-item";
        row.innerHTML = `
            <span>${lastMsg.slice(0, 30)}</span>
            <button class="delete-chat">✕</button>
        `;

        row.onclick = () => {
            sessionId = chat.id;
            localStorage.setItem("activeChatId", sessionId);
            loadChat(chat);
        };

        row.querySelector(".delete-chat").onclick = (e) => {
            e.stopPropagation();
            const updated = chats.filter(c => c.id !== chat.id);
            saveChats(updated);

            if (sessionId === chat.id) {
                messagesDiv.innerHTML = "";
                sessionId = createNewChatId();
            }

            renderChats();
        };

        chatList.appendChild(row);
    });
}

function loadChat(chat) {
    messagesDiv.innerHTML = "";
    chat.messages.forEach(m => {
        addMessage(m.role === "user" ? "You" : "AI", m.text);
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

    if (data.success && data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("userEmail", email);

        authDiv.classList.add("hidden");
        chatDiv.classList.remove("hidden");
        document.body.classList.add("logged-in");

        sendBtn.disabled = false;
        messagesDiv.innerHTML = "";

        addMessage("System", `Welcome back, ${email}!`);
        renderChats();
    }
};

/* ================= CHAT ================= */

sendBtn.onclick = async () => {
    const token = localStorage.getItem("token");
    const message = messageInput.value.trim();
    if (!token || !message) return;

    ensureChatExists();
    const chats = getChats();
    const chat = chats.find(c => c.id === sessionId);

    chat.messages.push({ role: "user", text: message });
    chat.updatedAt = Date.now();
    saveChats(chats);

    addMessage("You", message);
    messageInput.value = "";
    showLoading(true);

    try {
        const res = await fetch(`${API_BASE}/api/ai/chat`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ sessionId, message })
        });

        const data = await res.json();
        if (data.success) {
            chat.messages.push({ role: "ai", text: data.reply });
            chat.updatedAt = Date.now();
            saveChats(chats);

            streamText(data.reply);
            renderChats();
        }
    } finally {
        showLoading(false);
    }
};

messageInput.addEventListener("keydown", e => {
    if (e.key === "Enter") {
        e.preventDefault();
        sendBtn.click();
    }
});

/* ================= NEW CHAT ================= */

newChatBtn.onclick = () => {
    sessionId = createNewChatId();

    const chats = getChats();
    chats.unshift({
        id: sessionId,
        messages: [],
        updatedAt: Date.now()
    });

    saveChats(chats);
    messagesDiv.innerHTML = "";
    renderChats();
};

/* ================= LOGOUT ================= */

logoutBtn.onclick = () => {
    localStorage.clear();
    location.reload();
};

/* ================= INIT ================= */

window.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("token");
    const email = localStorage.getItem("userEmail");
    const chats = getChats();

    if (token) {
        authDiv.classList.add("hidden");
        chatDiv.classList.remove("hidden");
        document.body.classList.add("logged-in");
        sendBtn.disabled = false;

        if (chats.length) {
            sessionId = localStorage.getItem("activeChatId") || chats[0].id;
            loadChat(chats.find(c => c.id === sessionId));
        } else {
            addMessage("System", `Welcome back, ${email}`);
        }

        renderChats();
    } else {
        sendBtn.disabled = true;
    }
});

/* ================= MOBILE SIDEBAR ================= */

toggleSidebar.onclick = () => {
    sidebar.classList.toggle("open");
    document.body.classList.toggle("sidebar-open");
};
