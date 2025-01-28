import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY, // Make sure this is set
});

export default async function handler(req, res) {
    if (req.method !== "POST") {
        res.setHeader("Allow", ["POST"]);
        return res.status(405).json({ error: "Method Not Allowed" });
    }

    try {
        const { imageUrl, prompt } = req.body;

        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content:
                        "You are an AI that analyzes images based on given URLs and responds with insights or answers.",
                },
                { role: "user", content: `Analyze this image: ${imageUrl}. ${prompt}` },
            ],
        });

        const answer = response.choices[0].message.content;

        res.status(200).json({ answer });
    } catch (error) {
        console.error("Error analyzing image with OpenAI:", error.message || error.response.data);
        res.status(500).json({ error: "Failed to analyze the image." });
    }
}
