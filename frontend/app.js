const API_BASE = "https://ai-chat-api-a3wn.onrender.com";

// State management
let sessionId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
let isLoading = false;

// DOM elements
const authSection = document.getElementById('authSection');
const chatSection = document.getElementById('chatSection');
const loginTab = document.getElementById('loginTab');
const registerTab = document.getElementById('registerTab');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const messagesContainer = document.getElementById('messagesContainer');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const alertContainer = document.getElementById('alertContainer');

// Tab switching
loginTab.addEventListener('click', () => {
    loginTab.classList.add('active');
    registerTab.classList.remove('active');
    loginForm.classList.remove('hidden');
    registerForm.classList.add('hidden');
    clearAlerts();
});

registerTab.addEventListener('click', () => {
    registerTab.classList.add('active');
    loginTab.classList.remove('active');
    registerForm.classList.remove('hidden');
    loginForm.classList.add('hidden');
    clearAlerts();
});

// Alert functions
function showAlert(message, type = 'error') {
    clearAlerts();
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.textContent = message;
    alertContainer.appendChild(alert);
    setTimeout(() => alert.remove(), 5000);
}

function clearAlerts() {
    alertContainer.innerHTML = '';
}

// Registration
document.getElementById('registerBtn').addEventListener('click', async () => {
    const email = document.getElementById('registerEmail').value.trim();
    const password = document.getElementById('registerPassword').value;

    if (!email || !password) {
        showAlert('Please fill in all fields');
        return;
    }

    if (password.length < 6) {
        showAlert('Password must be at least 6 characters');
        return;
    }

    try {
        const res = await fetch(`${API_BASE}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await res.json();

        if (data.success) {
            showAlert('Account created! Please login.', 'success');
            setTimeout(() => {
                loginTab.click();
                document.getElementById('loginEmail').value = email;
            }, 1500);
        } else {
            showAlert(data.error || 'Registration failed');
        }
    } catch (error) {
        showAlert('Network error. Please try again.');
    }
});

// Login
document.getElementById('loginBtn').addEventListener('click', async () => {
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;

    if (!email || !password) {
        showAlert('Please fill in all fields');
        return;
    }

    try {
        const res = await fetch(`${API_BASE}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await res.json();

        if (data.success && data.token) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('userEmail', email);
            switchToChat();
        } else {
            showAlert(data.error || 'Login failed');
        }
    } catch (error) {
        showAlert('Network error. Please try again.');
    }
});

// Switch to chat view
function switchToChat() {
    authSection.classList.remove('active');
    chatSection.classList.add('active');
    messageInput.focus();

    // Add welcome message
    const email = localStorage.getItem('userEmail');
    addSystemMessage(`Welcome back, ${email}! 👋`);
}

// Add message to chat
function addMessage(text, type = 'user') {
    const emptyState = messagesContainer.querySelector('.empty-state');
    if (emptyState) {
        emptyState.remove();
    }

    const message = document.createElement('div');
    message.className = `message ${type}`;

    const time = new Date().toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
    });

    if (type === 'system') {
        message.innerHTML = `
            <div class="message-content">
                <div class="message-text">${text}</div>
            </div>
        `;
    } else {
        const avatar = type === 'user' ? '👤' : '🤖';
        const sender = type === 'user' ? 'You' : 'Nexus AI';

        message.innerHTML = `
            <div class="message-avatar ${type}-avatar">${avatar}</div>
            <div class="message-content">
                <div class="message-header">
                    <span class="message-sender">${sender}</span>
                    <span class="message-time">${time}</span>
                </div>
                <div class="message-text">${text}</div>
            </div>
        `;
    }

    messagesContainer.appendChild(message);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function addSystemMessage(text) {
    addMessage(text, 'system');
}

function addTypingIndicator() {
    const indicator = document.createElement('div');
    indicator.className = 'message ai';
    indicator.id = 'typingIndicator';
    indicator.innerHTML = `
        <div class="message-avatar ai-avatar-small">🤖</div>
        <div class="message-content">
            <div class="typing-indicator active">
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
            </div>
        </div>
    `;
    messagesContainer.appendChild(indicator);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function removeTypingIndicator() {
    const indicator = document.getElementById('typingIndicator');
    if (indicator) {
        indicator.remove();
    }
}

// Send message
async function sendMessage() {
    const text = messageInput.value.trim();
    if (!text || isLoading) return;

    const token = localStorage.getItem('token');
    if (!token) {
        logout();
        return;
    }

    isLoading = true;
    sendBtn.disabled = true;

    addMessage(text, 'user');
    messageInput.value = '';
    messageInput.style.height = 'auto';

    addTypingIndicator();

    try {
        const res = await fetch(`${API_BASE}/api/ai/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ sessionId, message: text })
        });

        const data = await res.json();
        removeTypingIndicator();

        if (data.success && data.reply) {
            addMessage(data.reply, 'ai');
        } else {
            addMessage(data.error || 'Failed to get response', 'error');

            if (res.status === 401) {
                setTimeout(() => {
                    logout();
                    showAlert('Session expired. Please login again.');
                }, 2000);
            }
        }
    } catch (error) {
        removeTypingIndicator();
        addMessage('Network error. Please check your connection.', 'error');
    } finally {
        isLoading = false;
        sendBtn.disabled = false;
        messageInput.focus();
    }
}

sendBtn.addEventListener('click', sendMessage);

// Enter to send (Shift+Enter for new line)
messageInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

// Auto-resize textarea
messageInput.addEventListener('input', function () {
    this.style.height = 'auto';
    this.style.height = Math.min(this.scrollHeight, 120) + 'px';
});

// Logout
document.getElementById('logoutBtn').addEventListener('click', logout);

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    chatSection.classList.remove('active');
    authSection.classList.add('active');
    messagesContainer.innerHTML = `
        <div class="empty-state">
            <div class="empty-state-icon">💬</div>
            <p>Start a conversation with Nexus AI.<br>Ask me anything!</p>
        </div>
    `;
    document.getElementById('loginEmail').value = '';
    document.getElementById('loginPassword').value = '';
    document.getElementById('registerEmail').value = '';
    document.getElementById('registerPassword').value = '';
}

// Check for existing session on load
window.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (token) {
        switchToChat();
    }
});

// Enter key on login forms
document.getElementById('loginPassword').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') document.getElementById('loginBtn').click();
});

document.getElementById('registerPassword').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') document.getElementById('registerBtn').click();
});