const { GoogleGenerativeAI } = require("@google/generative-ai");
const axios = require('axios');

// Initialize Google AI
// Note: This relies on GEMINI_API_KEY being in your .env file
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Downloads an image from a URL and converts it to the format Gemini expects.
 */
async function urlToGenerativePart(url) {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    return {
        inlineData: {
            data: Buffer.from(response.data).toString("base64"),
            mimeType: response.headers["content-type"] || "image/jpeg",
        },
    };
}

/**
 * Analyzes an image using Google Gemini 1.5 Flash.
 * Generates Tags and a Vector Embedding.
 */
async function analyzeImage(imageUrl) {
    if (!imageUrl) return { tags: [], embedding: [] };

    try {
        console.log("🤖 Asking Gemini to see...");
        
        // --- 1. VISION ANALYSIS (Tags & Description) ---
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        const imagePart = await urlToGenerativePart(imageUrl);

        const prompt = `
            Analyze this image for a Pinterest-style feed. 
            Return a purely JSON object (no markdown, no backticks).
            Structure:
            {
                "tags": ["5-8", "adjectives", "or", "styles", "describing", "vibe"],
                "description": "A concise visual description of the content and color palette."
            }
        `;

        const result = await model.generateContent([prompt, imagePart]);
        const response = await result.response;
        let text = response.text();

        // Clean up markdown if Gemini adds it (e.g., ```json ... ```)
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();
        
        const analysis = JSON.parse(text);
        console.log("✨ Gemini Tags:", analysis.tags);

        // --- 2. EMBEDDING (Vector Math) ---
        // We use the description + tags to create the "Search Vector"
        const embeddingModel = genAI.getGenerativeModel({ model: "text-embedding-004" });
        const embedText = `${analysis.description} ${analysis.tags.join(" ")}`;
        
        const embeddingResult = await embeddingModel.embedContent(embedText);
        const embedding = embeddingResult.embedding.values;

        return {
            tags: analysis.tags,
            embedding: embedding
        };

    } catch (error) {
        console.error("❌ Gemini Analysis Failed:", error.message);
        // Fallback: Return empty so the upload still succeeds
        return { tags: [], embedding: [] };
    }
}

module.exports = { analyzeImage };



// const axios = require('axios');

// /**
//  * Robust AI Analyzer
//  * Tries multiple models (Classification AND Captioning) to guarantee a result.
//  */
// async function retryWithFallback(imageUrl, token) {
//     const strategies = [
//         {
//             model: "google/vit-base-patch16-224",
//             type: "classification"
//         },
//         {
//             model: "Salesforce/blip-image-captioning-base", // <--- NEW: High availability model
//             type: "captioning"
//         },
//         {
//             model: "microsoft/resnet-50",
//             type: "classification"
//         }
//     ];

//     const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
//     const imageBuffer = Buffer.from(imageResponse.data);

//     for (const strategy of strategies) {
//         try {
//             console.log(`🤖 Trying AI Model: ${strategy.model}...`);
//             const response = await axios.post(
//                 `https://router.huggingface.co/hf-inference/models/${strategy.model}`,
//                 imageBuffer,
//                 { headers: { Authorization: `Bearer ${token}` } }
//             );

//             // --- STRATEGY ADAPTER ---
//             // If it's a classification model, it returns labels.
//             if (strategy.type === "classification" && Array.isArray(response.data)) {
//                 return response.data.map(item => item.label.split(',')[0].trim());
//             }
            
//             // If it's a captioning model, it returns a sentence. We turn that into tags.
//             if (strategy.type === "captioning" && Array.isArray(response.data) && response.data[0].generated_text) {
//                 const caption = response.data[0].generated_text;
//                 console.log(`📝 Generated Caption: "${caption}"`);
//                 // Simple trick: Split sentence into words to create "tags"
//                 return caption.split(' ')
//                     .filter(word => word.length > 3) // Remove 'a', 'the', 'is'
//                     .slice(0, 5); // Take first 5 meaningful words
//             }

//         } catch (error) {
//             console.warn(`⚠️ Model ${strategy.model} failed (${error.response?.status || 'Unknown'}). Switching...`);
//         }
//     }
//     throw new Error("All AI Vision models are currently down.");
// }

// async function analyzeImage(imageUrl) {
//     const HF_TOKEN = process.env.HF_API_KEY;
//     if (!imageUrl) return { tags: [], embedding: [] };

//     try {
//         // --- STEP 1: GET TAGS (With Fallback) ---
//         const tags = await retryWithFallback(imageUrl, HF_TOKEN);
//         console.log("✨ Tags generated:", tags);

//         // --- STEP 2: EMBEDDING (Feature Extraction) ---
//         // We use the tags we just found to generate the math vector
//         const textDescription = tags.join(" ");
//         let embedding = [];
        
//         try {
//             const embeddingResponse = await axios.post(
//                 "https://router.huggingface.co/hf-inference/models/sentence-transformers/all-MiniLM-L6-v2",
//                 { inputs: textDescription },
//                 { headers: { Authorization: `Bearer ${HF_TOKEN}` } }
//             );
//             // Handle Embedding Response Format
//             embedding = embeddingResponse.data;
//             if (Array.isArray(embedding) && Array.isArray(embedding[0])) {
//                 embedding = embedding[0];
//             }
//         } catch (embedError) {
//             console.warn("⚠️ Embedding failed (Skipping vector search for this pin).");
//         }

//         return { tags, embedding };

//     } catch (error) {
//         console.error("❌ All AI attempts failed. Uploading without tags.");
//         // Return empty arrays so the upload SUCCEEDS even if AI fails
//         return { tags: [], embedding: [] };
//     }
// }

// module.exports = { analyzeImage };