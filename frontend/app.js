// app.js - Improved Frontend JavaScript

const API_BASE = "https://ai-chat-api-a3wn.onrender.com";

const authDiv = document.getElementById("auth");
const chatDiv = document.getElementById("chat");
const messagesDiv = document.getElementById("messages");

const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const messageInput = document.getElementById("messageInput");

// Create a unique session ID for this user
let sessionId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Helper function to display messages
function addMessage(sender, text, isError = false) {
    const messageEl = document.createElement("p");
    messageEl.innerHTML = `<b>${sender}:</b> ${text}`;
    if (isError) {
        messageEl.style.color = "red";
    }
    messagesDiv.appendChild(messageEl);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// Helper function to show loading indicator
function showLoading(show) {
    const sendBtn = document.getElementById("sendBtn");
    if (show) {
        sendBtn.disabled = true;
        sendBtn.textContent = "Sending...";
    } else {
        sendBtn.disabled = false;
        sendBtn.textContent = "Send";
    }
}

// Register button handler
document.getElementById("registerBtn").onclick = async () => {
    const email = emailInput.value.trim();
    const password = passwordInput.value;

    // Validation
    if (!email || !password) {
        alert("Please enter both email and password");
        return;
    }

    if (password.length < 6) {
        alert("Password must be at least 6 characters long");
        return;
    }

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
    } catch (error) {
        console.error("Register error:", error);
        alert("Network error. Please check your connection.");
    }
};

// Login button handler
document.getElementById("loginBtn").onclick = async () => {
    const email = emailInput.value.trim();
    const password = passwordInput.value;

    // Validation
    if (!email || !password) {
        alert("Please enter both email and password");
        return;
    }

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

            // Switch to chat view
            authDiv.classList.add("hidden");
            chatDiv.classList.remove("hidden");

            // Welcome message
            messagesDiv.innerHTML = "";
            addMessage("System", `Welcome back, ${email}! Start chatting with the AI.`);

            // Focus on message input
            messageInput.focus();
        } else {
            alert(data.error || "Login failed");
        }
    } catch (error) {
        console.error("Login error:", error);
        alert("Network error. Please check your connection and try again.");
    }
};

// Send message button handler
document.getElementById("sendBtn").onclick = async () => {
    const token = localStorage.getItem("token");
    const message = messageInput.value.trim();

    // Validation
    if (!message) {
        return;
    }

    if (!token) {
        alert("Please login first");
        return;
    }

    try {
        // Show user message immediately
        addMessage("You", message);
        messageInput.value = "";
        showLoading(true);

        const res = await fetch(`${API_BASE}/api/ai/chat`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                sessionId: sessionId,
                message: message
            })
        });

        const data = await res.json();

        if (data.success && data.reply) {
            addMessage("AI", data.reply);
        } else {
            // Handle error
            addMessage("System", data.error || "Failed to get response", true);

            // If token expired, logout
            if (res.status === 401) {
                setTimeout(() => {
                    logout();
                    alert("Session expired. Please login again.");
                }, 2000);
            }
        }
    } catch (error) {
        console.error("Chat error:", error);
        addMessage("System", "Network error. Please check your connection.", true);
    } finally {
        showLoading(false);
        messageInput.focus();
    }
};

// Allow Enter key to send message
messageInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        document.getElementById("sendBtn").click();
    }
});

// Logout function
function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("userEmail");
    chatDiv.classList.add("hidden");
    authDiv.classList.remove("hidden");
    messagesDiv.innerHTML = "";
    emailInput.value = "";
    passwordInput.value = "";
}

// Check if user is already logged in
window.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("token");
    const email = localStorage.getItem("userEmail");

    if (token) {
        // Auto-login if token exists
        authDiv.classList.add("hidden");
        chatDiv.classList.remove("hidden");
        messagesDiv.innerHTML = "";
        addMessage("System", `Welcome back, ${email || "User"}! Continue your conversation.`);
        messageInput.focus();
    }
});

// Optional: Add logout button functionality if it exists
const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
    logoutBtn.onclick = logout;
}