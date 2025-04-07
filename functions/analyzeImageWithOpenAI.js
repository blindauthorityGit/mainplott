export default async function analyzeImageWithOpenAI(imageUrl, prompt) {
    try {
        const response = await fetch("/api/openai", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                imageUrl,
                prompt: `Here is an image URL: ${imageUrl}. ${prompt}`,
            }),
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.statusText}`);
        }

        const data = await response.json();

        return data.answer; // Return the OpenAI response
    } catch (error) {
        console.error("Error calling OpenAI API:", error);
        return null;
    }
}
