import mongoose from "mongoose";

const memorySchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, required: true },
    name: { type: String },
}, { timestamps: true });

export default mongoose.model("Memory", memorySchema);
