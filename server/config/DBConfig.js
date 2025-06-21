// DBConfig.js
require('dotenv').config();

module.exports = {
  HOST: process.env.DB_HOST || 'localhost',
  USER: process.env.DB_USER || 'root',
  PASSWORD: process.env.DB_PASSWORD || 'qwer1234', //임시PW
  DB: process.env.DB_NAME || 'CloudGuardian', //임시NAME
  dialect: 'mysql',
};
