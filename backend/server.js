const express = require("express");
const cors = require("cors"); // Import cors
const tokenBucketLimiter = require("./tokenBucketLimiter");

const app = express();
const PORT = 3000;

// Use CORS middleware and allow requests from http://localhost:5173
app.use(cors({
  origin: "http://localhost:5173",
}));

// Apply token bucket rate limiter middleware
app.use(tokenBucketLimiter);

// Example endpoint
app.get("/", (req, res) => {
  res.send({ message: "Request allowed, welcome to the server!" });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
