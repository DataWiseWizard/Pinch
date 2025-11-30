const axios = require('axios');

/**
 * Analyzes an image using Hugging Face (Free Tier).
 * 1. Uses Google's Vision Transformer (ViT) to identify the image content.
 * 2. Uses MiniLM to create a vector embedding for recommendations.
 * * @param {string} imageUrl - The public Cloudinary URL.
 * @returns {Promise<{tags: string[], embedding: number[]}>}
 */
async function analyzeImage(imageUrl) {
    const HF_TOKEN = process.env.HF_API_KEY;
    
    // Check if image URL is valid
    if (!imageUrl) return { tags: [], embedding: [] };

    try {
        // --- STEP 1: GET TAGS (Image Classification) ---
        // We fetch the image data as a buffer to send to Hugging Face
        const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
        const imageBuffer = Buffer.from(imageResponse.data);

        // Call Model: google/vit-base-patch16-224
        const taggingResponse = await axios.post(
            "https://api-inference.huggingface.co/models/google/vit-base-patch16-224",
            imageBuffer,
            { headers: { Authorization: `Bearer ${HF_TOKEN}` } }
        );

        // Hugging Face returns an array of objects: [{ label: "tabby cat", score: 0.9 }, ...]
        // We take the top 5 labels
        const rawTags = taggingResponse.data;
        if (!Array.isArray(rawTags)) {
             console.log("⚠️ HF Tagging Warning:", rawTags);
             return { tags: [], embedding: [] };
        }

        const tags = rawTags
            .slice(0, 5) // Take top 5
            .map(item => item.label.split(',')[0].trim()); // Clean "tabby, tabby cat" -> "tabby"

        // --- STEP 2: GET EMBEDDING (Feature Extraction) ---
        // We turn the tags into a "sentence" to get the vector.
        const textDescription = tags.join(" ");
        
        // Call Model: sentence-transformers/all-MiniLM-L6-v2
        const embeddingResponse = await axios.post(
            "https://api-inference.huggingface.co/models/sentence-transformers/all-MiniLM-L6-v2",
            { inputs: textDescription },
            { headers: { Authorization: `Bearer ${HF_TOKEN}` } }
        );

        // The response is the array of numbers (vector)
        let embedding = embeddingResponse.data;
        
        // Handle simplified API response edge cases
        if (Array.isArray(embedding) && Array.isArray(embedding[0])) {
            embedding = embedding[0]; // Sometimes it returns [[0.1, ...]]
        }

        return { tags, embedding };

    } catch (error) {
        console.error("🤖 AI Analysis Failed:", error.message);
        // If it's a model loading error (common on free tier), log it specifically
        if (error.response && error.response.data && error.response.data.error) {
            console.error("HF Error Details:", error.response.data.error);
        }
        // Return empty so the app doesn't crash
        return { tags: [], embedding: [] };
    }
}

module.exports = { analyzeImage };