const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-access-token-secret-change-in-production';
const REFRESH_SECRET = process.env.REFRESH_SECRET || 'your-refresh-token-secret-change-in-production';

const generateAccessToken = (user) => {
    return jwt.sign(
        { 
            id: user._id, 
            email: user.email, 
            username: user.username 
        },
        JWT_SECRET,
        { expiresIn: '30m' } // 30 minutes
    );
};

const generateRefreshToken = (user) => {
    return jwt.sign(
        { 
            id: user._id,
            version: user.refreshTokenVersion || 0
        },
        REFRESH_SECRET,
        { expiresIn: '7d' } // 7 days
    );
};

const verifyAccessToken = (token) => {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        return null;
    }
};

const verifyRefreshToken = (token) => {
    try {
        return jwt.verify(token, REFRESH_SECRET);
    } catch (error) {
        return null;
    }
};

module.exports = { 
    generateAccessToken, 
    generateRefreshToken,
    verifyAccessToken, 
    verifyRefreshToken 
};