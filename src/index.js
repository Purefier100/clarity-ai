import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import express from "express";
import cors from "cors";

import aiRoutes from "./routes/ai.routes.js";
import chatRoutes from "./routes/chat.routes.js";
import authRoutes from "./routes/auth.routes.js";
import { connectDB } from "./config/db.js";
import { apiLimiter, aiLimiter } from "./middleware/rateLimit.middleware.js";

// Load env
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "../.env") });

// Init app
const app = express();

// ✅ CORRECT CORS (NO CRASH, NO BLOCK)
app.use(cors({
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

// DB
connectDB();

// Rate limiting
app.use(apiLimiter);
app.use("/api/ai", aiLimiter);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/ai", chatRoutes);

// Health
app.get("/", (req, res) => {
    res.json({ status: "AI API running 🚀" });
});

// Start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
