// server/redis.js
const Redis = require('ioredis');
const redis = new Redis(process.env.REDIS_URL);

// aws 배포 시
/* const redis = new Redis({
  host: process.env.REDIS_HOST,       // ex) "my-cache.xxxxxx.0001.use1.cache.amazonaws.com"
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD,  // (암호화 활성화한 경우)
  tls: process.env.REDIS_TLS === 'true' ? {} : undefined, // TLS 연결이 필요하면
});
 */

redis.on('error', err => {
  console.error('[Redis] error', err);
});

module.exports = redis;
