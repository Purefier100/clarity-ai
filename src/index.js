import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

// Resolve correct path to .env (Windows-safe)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../.env") });

import express from "express";
import aiRoutes from "./routes/ai.routes.js";
import chatRoutes from "./routes/chat.routes.js";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/auth.routes.js";
import { apiLimiter, aiLimiter } from "./middleware/rateLimit.middleware.js";



connectDB();


const app = express();
app.use(express.json());

app.use("/api/ai", aiRoutes);

// Apply to ALL requests
app.use(apiLimiter);

// Apply stricter limit only to AI routes
app.use("/api/ai", aiLimiter);


app.use("/api/auth", authRoutes);

app.use("/api/ai", chatRoutes);

app.get("/", (req, res) => {
    res.json({ status: "AI API running 🚀" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
    console.log(`Server running on port ${PORT}`)
);
