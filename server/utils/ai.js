const axios = require('axios');

/**
 * Helper to call HF with fallback
 */
async function retryWithFallback(imageUrl, token) {
    const models = [
        "google/vit-base-patch16-224", // Primary (Best accuracy)
        "microsoft/resnet-50",       // Backup (High stability)
        "facebook/detr-resnet-50"    // Emergency Backup
    ];

    const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    const imageBuffer = Buffer.from(imageResponse.data);

    for (const model of models) {
        try {
            console.log(`🤖 Trying AI Model: ${model}...`);
            const response = await axios.post(
                `https://router.huggingface.co/hf-inference/models/${model}`,
                imageBuffer,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            return response.data; // Success!
        } catch (error) {
            console.warn(`⚠️ Model ${model} failed (${error.response?.status || 'Unknown'}). Switching to backup...`);
            // Continue loop to next model
        }
    }
    throw new Error("All AI Vision models are currently down.");
}

async function analyzeImage(imageUrl) {
    const HF_TOKEN = process.env.HF_API_KEY;
    if (!imageUrl) return { tags: [], embedding: [] };

    try {
        // --- STEP 1: ROBUST TAGGING ---
        const rawTags = await retryWithFallback(imageUrl, HF_TOKEN);

        if (!Array.isArray(rawTags)) {
            return { tags: [], embedding: [] };
        }

        const tags = rawTags
            .slice(0, 5)
            .map(item => item.label.split(',')[0].trim());

        console.log("✨ Tags generated:", tags);

        // --- STEP 2: EMBEDDING ---
        // (Keep using MiniLM as it's rarely down, but handle its errors gracefully too)
        const textDescription = tags.join(" ");
        let embedding = [];

        try {
            const embeddingResponse = await axios.post(
                "https://router.huggingface.co/hf-inference/models/sentence-transformers/all-MiniLM-L6-v2",
                { inputs: textDescription },
                { headers: { Authorization: `Bearer ${HF_TOKEN}` } }
            );
            embedding = embeddingResponse.data;
            if (Array.isArray(embedding) && Array.isArray(embedding[0])) {
                embedding = embedding[0];
            }
        } catch (embedError) {
            console.warn("⚠️ Embedding failed, saving tags only.");
        }

        return { tags, embedding };

    } catch (error) {
        console.error("❌ All AI attempts failed:", error.message);
        return { tags: [], embedding: [] };
    }
}

module.exports = { analyzeImage };