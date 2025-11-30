const OpenAI = require('openai');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY, 
});

/**
 * Analyzes an image to generate Tags and a Vector Embedding.
 * @param {string} imageUrl - The public Cloudinary URL of the uploaded image.
 * @returns {Promise<{tags: string[], embedding: number[]}>}
 */
async function analyzeImage(imageUrl) {
    try {
        // 1. VISION: Ask GPT-4o to "see" the image and generate tags/description
        const visionResponse = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "user",
                    content: [
                        { type: "text", text: "Analyze this image for a Pinterest-style feed. Return a JSON object with two fields: 'tags' (array of 5-8 descriptive strings capturing style, vibe, and content) and 'description' (a concise visual summary)." },
                        { type: "image_url", image_url: { url: imageUrl } },
                    ],
                },
            ],
            response_format: { type: "json_object" }, // Force JSON structure
        });

        const analysis = JSON.parse(visionResponse.choices[0].message.content);
        
        // 2. EMBEDDING: Turn the "description" + "tags" into a Vector (Math)
        // This vector represents the "meaning" of the image.
        const embeddingResponse = await openai.embeddings.create({
            model: "text-embedding-3-small",
            input: `${analysis.description} ${analysis.tags.join(" ")}`,
        });

        return {
            tags: analysis.tags,
            embedding: embeddingResponse.data[0].embedding
        };

    } catch (error) {
        console.error("AI Analysis Failed:", error);
        // Fallback: return empty data so the upload doesn't crash
        return { tags: [], embedding: [] };
    }
}

module.exports = { analyzeImage };