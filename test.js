import dotenv from "dotenv";
dotenv.config();

import { GoogleGenerativeAI } from "@google/generative-ai";

console.log(
    "TEST API KEY:",
    process.env.GEMINI_API_KEY ? "LOADED ✅" : "MISSING ❌"
);

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({
    model: "text-bison-001",
});

const result = await model.generateContent("Hello");
console.log(result.response.text());

