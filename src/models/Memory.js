import mongoose from "mongoose";

const memorySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true
    },
    name: String
});

export default mongoose.model("Memory", memorySchema);

