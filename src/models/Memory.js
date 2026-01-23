import mongoose from "mongoose";

const memorySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    name: {
        type: String
    }
});

export default mongoose.model("Memory", memorySchema);

