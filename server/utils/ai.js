const axios = require('axios');

/**
 * Robust AI Analyzer
 * Tries multiple models (Classification AND Captioning) to guarantee a result.
 */
async function retryWithFallback(imageUrl, token) {
    const strategies = [
        {
            model: "google/vit-base-patch16-224",
            type: "classification"
        },
        {
            model: "Salesforce/blip-image-captioning-base", // <--- NEW: High availability model
            type: "captioning"
        },
        {
            model: "microsoft/resnet-50",
            type: "classification"
        }
    ];

    const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    const imageBuffer = Buffer.from(imageResponse.data);

    for (const strategy of strategies) {
        try {
            console.log(`🤖 Trying AI Model: ${strategy.model}...`);
            const response = await axios.post(
                `https://router.huggingface.co/hf-inference/models/${strategy.model}`,
                imageBuffer,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // --- STRATEGY ADAPTER ---
            // If it's a classification model, it returns labels.
            if (strategy.type === "classification" && Array.isArray(response.data)) {
                return response.data.map(item => item.label.split(',')[0].trim());
            }
            
            // If it's a captioning model, it returns a sentence. We turn that into tags.
            if (strategy.type === "captioning" && Array.isArray(response.data) && response.data[0].generated_text) {
                const caption = response.data[0].generated_text;
                console.log(`📝 Generated Caption: "${caption}"`);
                // Simple trick: Split sentence into words to create "tags"
                return caption.split(' ')
                    .filter(word => word.length > 3) // Remove 'a', 'the', 'is'
                    .slice(0, 5); // Take first 5 meaningful words
            }

        } catch (error) {
            console.warn(`⚠️ Model ${strategy.model} failed (${error.response?.status || 'Unknown'}). Switching...`);
        }
    }
    throw new Error("All AI Vision models are currently down.");
}

async function analyzeImage(imageUrl) {
    const HF_TOKEN = process.env.HF_API_KEY;
    if (!imageUrl) return { tags: [], embedding: [] };

    try {
        // --- STEP 1: GET TAGS (With Fallback) ---
        const tags = await retryWithFallback(imageUrl, HF_TOKEN);
        console.log("✨ Tags generated:", tags);

        // --- STEP 2: EMBEDDING (Feature Extraction) ---
        // We use the tags we just found to generate the math vector
        const textDescription = tags.join(" ");
        let embedding = [];
        
        try {
            const embeddingResponse = await axios.post(
                "https://router.huggingface.co/hf-inference/models/sentence-transformers/all-MiniLM-L6-v2",
                { inputs: textDescription },
                { headers: { Authorization: `Bearer ${HF_TOKEN}` } }
            );
            // Handle Embedding Response Format
            embedding = embeddingResponse.data;
            if (Array.isArray(embedding) && Array.isArray(embedding[0])) {
                embedding = embedding[0];
            }
        } catch (embedError) {
            console.warn("⚠️ Embedding failed (Skipping vector search for this pin).");
        }

        return { tags, embedding };

    } catch (error) {
        console.error("❌ All AI attempts failed. Uploading without tags.");
        // Return empty arrays so the upload SUCCEEDS even if AI fails
        return { tags: [], embedding: [] };
    }
}

module.exports = { analyzeImage };