const rateLimit = require("express-rate-limit");

const apiLimit = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 5, // Limit 5 attempts per minute
    message: {
        status: 429,
        error: "Too many attempts, please try again later"
    },
});

module.exports = { apiLimit };
