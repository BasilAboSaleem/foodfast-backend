const Redis = require("ioredis");

// Redis client 
const redis = new Redis({
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: process.env.REDIS_PORT || 6379,
});

// Publisher 
const pub = new Redis({
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: process.env.REDIS_PORT || 6379,
});

// Subscriber 
const sub = new Redis({
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: process.env.REDIS_PORT || 6379,
});

// Event listeners
redis.on("connect", () => console.log("✅ Connected to Redis (cache)"));
redis.on("error", (err) => console.error("❌ Redis error (cache):", err));

pub.on("connect", () => console.log("✅ Redis Publisher connected"));
pub.on("error", (err) => console.error("❌ Redis Publisher error:", err));

sub.on("connect", () => console.log("✅ Redis Subscriber connected"));
sub.on("error", (err) => console.error("❌ Redis Subscriber error:", err));

module.exports = { redis, pub, sub };
