import mongoose from "mongoose";

const chatMessageSchema = new mongoose.Schema(
    {
        sessionId: { type: String, required: true },
        role: {
            type: String,
            enum: ["user", "assistant"],
            required: true
        },
        message: {
            type: String,
            required: true
        }
    },
    { timestamps: true }
);

export default mongoose.model("ChatMessage", chatMessageSchema);
