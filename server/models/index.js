// index.js

const Sequelize = require('sequelize');
const dbConfig = require('../config/DBConfig');

const sequelize = new Sequelize(
  dbConfig.DB,
  dbConfig.USER,
  dbConfig.PASSWORD,
  {
    host: dbConfig.HOST,
    dialect: dbConfig.dialect,
    logging: false,
  }
);

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.User = require('./UserModel')(sequelize, Sequelize);
db.Post = require('./PostModel')(sequelize, Sequelize);

// 관계 설정
// db.User.hasMany(Post);
// db.Post.belongsTo(db.User);
db.Post.belongsTo(db.User, { foreignKey: 'userId' });
db.User.hasMany(db.Post, { foreignKey: 'userId' });

module.exports = db;
