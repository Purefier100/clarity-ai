import axios from "axios";

export const generateAIResponse = async (userMessage) => {
    try {
        // Example using a free AI API (you can replace with your preferred API)
        const response = await axios.post(
            "https://api.anthropic.com/v1/messages",
            {
                model: "claude-sonnet-4-20250514",
                max_tokens: 1000,
                messages: [
                    {
                        role: "user",
                        content: userMessage
                    }
                ]
            },
            {
                headers: {
                    "Content-Type": "application/json",
                    "x-api-key": process.env.ANTHROPIC_API_KEY,
                    "anthropic-version": "2023-06-01"
                }
            }
        );

        return response.data.content[0].text;

    } catch (error) {
        console.error("AI Service Error:", error.response?.data || error.message);
        return "I apologize, but I'm having trouble processing your request right now. Please try again.";
    }
};