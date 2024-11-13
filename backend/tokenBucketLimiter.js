const buckets = {}; // Holds token data for each user/IP

// Token bucket settings
const BUCKET_CAPACITY = 4; // Maximum capacity of tokens in the bucket
const REFILL_RATE = 2; // Tokens added every minute
const REFILL_INTERVAL = 60 * 1000; // Refill every 60 seconds (1 minute)

// Middleware for token bucket rate limiting with individual token refill
function tokenBucketLimiter(req, res, next) {
    const key = req.ip;

    if (!buckets[key]) {
        buckets[key] = { tokens: BUCKET_CAPACITY, lastRefill: Date.now() };
    }

    // Refill tokens for the current IP before processing the request
    const now = Date.now();
    const bucket = buckets[key];
    const elapsedTime = (now - bucket.lastRefill) / REFILL_INTERVAL;
    const tokensToAdd = Math.floor(elapsedTime * REFILL_RATE);

    if (tokensToAdd > 0) {
        bucket.tokens = Math.min(bucket.tokens + tokensToAdd, BUCKET_CAPACITY);
        bucket.lastRefill = now;
    }

    if (bucket.tokens > 0) {
        bucket.tokens -= 1;
        console.log("Request successful. Tokens remaining:", bucket.tokens); // Log successful requests
        next();
    } else {
        // Calculate wait time for the next token
        const timeUntilNextToken = Math.ceil((REFILL_INTERVAL - (now - bucket.lastRefill)) / 1000);
        console.log(`Rate limit exceeded. Try again in ${timeUntilNextToken} seconds.`);
        res.status(429).json({
            message: "Too many requests. Please try again later.",
            retryAfter: timeUntilNextToken, // Send retry time in seconds
        });
    }
}

module.exports = tokenBucketLimiter;
