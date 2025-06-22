// server/redis.js
const Redis = require('ioredis');
const redis = new Redis(process.env.REDIS_URL);

redis.on('error', err => {
  console.error('[Redis] error', err);
});

module.exports = redis;
