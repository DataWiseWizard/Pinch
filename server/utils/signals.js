const User = require("../models/user");


/**
 * Updates a user's interest profile based on interaction.
 * @param {string} userId - The ID of the user.
 * @param {string[]} tags - Array of tags from the interacted pin.
 * @param {number} score - Points to add (e.g., 1 for view, 5 for save).
 */
async function updateUserInterests(userId, tags, score) {
    if (!userId || !tags || tags.length === 0) return;

    try {
        const user = await User.findById(userId);
        if (!user) return;

        // Ensure the map exists
        if (!user.interestProfile) {
            user.interestProfile = new Map();
        }

        // Loop through tags and update scores
        tags.forEach(tag => {
            // Normalize tag to lowercase to prevent duplicates like "Anime" vs "anime"
            const cleanTag = tag.toLowerCase().trim();
            const currentScore = user.interestProfile.get(cleanTag) || 0;
            
            // Update the score
            user.interestProfile.set(cleanTag, currentScore + score);
        });

        await user.save();
        console.log(`📈 Interests Updated for ${user.username}: +${score} points on [${tags.join(", ")}]`);
        
    } catch (error) {
        // We log but do NOT throw. Analytics errors should never crash the user experience.
        console.error("Signal Tracking Error:", error);
    }
}

module.exports = { updateUserInterests };