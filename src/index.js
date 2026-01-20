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

// ✅ CORS MUST COME BEFORE ROUTES
app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));
app.options("*", cors());

app.use(express.json());

// Connect DB
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

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
    console.log(`Server running on port ${PORT}`)
);
