# 🚀 Clarity AI  
**A modern, open-source AI chat platform built for speed, clarity, and control.**

Clarity AI is a ChatGPT-inspired web application that lets users authenticate, create multiple conversations, and chat with an AI in a clean, responsive interface — without frameworks, bloat, or lock-in.

Designed as a **production-ready foundation** for AI chat products.

---

## ✨ Why Clarity AI?

- ⚡ **Fast** — Built with vanilla JavaScript, no frontend frameworks  
- 🧠 **Persistent** — Chats survive refreshes and reloads  
- 🔐 **Secure** — Token-based authentication  
- 🧩 **Extensible** — Easy to connect to any AI backend  
- 🎨 **Polished UI** — Clean, ChatGPT-style user experience  

---

## 🧩 Features

### 🔐 Authentication
- Email & password login and registration
- Token-based session handling

### 💬 Multi-Chat System
- Create new chats anytime
- Switch between conversations
- Delete individual chats

### 💾 Persistent Chat History
- Conversations stored locally
- Chats and messages persist after refresh
- Last active chat restored automatically

### 🧠 AI Messaging
- AI-powered chat responses
- Typing-style streaming effect
- Clean message bubbles with roles

### 📱 Responsive Layout
- Desktop-first interface
- Mobile support (in progress)

---

## 🛠 Tech Stack

**Frontend**
- HTML5
- CSS3
- Vanilla JavaScript

**Backend**
- Custom AI API
- REST endpoints
- Token-based authentication

---

## 📂 Project Structure

├── index.html # App layout
├── style.css # UI styling
├── app.js # Application logic
├── manifest.json # PWA configuration
├── sw.js # Service worker
└── README.md


---

## 🚀 Getting Started

### 1️⃣ Clone the repository
```bash
git clone https://github.com/purefier100/clarity-ai.git
cd clarity-ai

Option A — Open directly

Open index.html in your browser.

Option B — Use a local server

npx serve

Backend API
const API_BASE = "https://ai-chat-api-a3wn.onrender.com";

🧠 How Chat Persistence Works

Each chat has a unique chatId

Messages are stored in localStorage

Sidebar shows chat previews

Chats persist even after refreshing the page

⚠️ Current Limitations

Mobile sidebar UX still being refined

Chats stored locally (not yet synced to backend)

No AI-generated chat titles (yet)

🛣 Roadmap

 Database-backed chat storage

 AI-generated chat titles

 True streaming responses (SSE / WebSockets)

 Mobile UX polish

 User memory and preferences

 Public landing page

🤝 Contributing

Contributions are welcome.

Fork the repository

Create a feature branch

Make your changes

Open a pull request

📄 License

MIT License
Free to use, modify, and build upon.

👤 Author

Built by Purefier

⭐ Support

If this project helped you or inspired your work,
please consider giving it a star ⭐ on GitHub.