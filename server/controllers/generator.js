const axios = require('axios');
const { cloudinary } = require("../config/cloudConfig");
const ExpressError = require("../utils/ExpressError");

module.exports.generateImage = async (req, res, next) => {
    const { prompt } = req.body;

    if (!prompt) {
        throw new ExpressError(400, "Prompt is required");
    }

    try {
        console.log(`🎨 Generating image for: "${prompt}"`);

        // 1. Call Pollinations.ai (Flux Model is great for details)
        // We use a random seed to ensure unique images every time
        const seed = Math.floor(Math.random() * 10000);
        const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?model=flux&width=1024&height=1024&seed=${seed}&nologo=true`;
        //https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?model=flux&seed=${seed}
        // 2. Fetch the image data as a buffer
        const response = await axios.get(imageUrl, { responseType: 'arraybuffer', timeout: 15000 });
        const imageBuffer = Buffer.from(response.data);

        // 3. Upload to Cloudinary using a stream
        // This avoids saving a temporary file to disk
        const uploadResult = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                { folder: "PINCH_AI_GEN" },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );
            stream.end(imageBuffer);
        });

        console.log("✅ Image generated & uploaded:", uploadResult.secure_url);

        // 4. Return the Cloudinary URL to the frontend
        res.status(200).json({ 
            url: uploadResult.secure_url, 
            filename: uploadResult.public_id 
        });

    } catch (error) {
        if (error.response && error.response.status === 429) {
        console.error("🚨 API Rate Limited: The AI queue is currently full.");
        return next(new ExpressError(429, "The AI generator is busy. Please try again in a minute."));
    }
    console.error("Generation failed:", error);
    next(new ExpressError(500, "Failed to generate image"));
    }
};