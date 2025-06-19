// server/models/PostModel.js
module.exports = (sequelize, DataTypes) => {
  const Post = sequelize.define('Post', {
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    board: {
      type: DataTypes.STRING,
      defaultValue: 'free',
    },
    mediaUrl: {
      type: DataTypes.STRING,  // 업로드된 파일의 public URL
      allowNull: true,
    },
    viewCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    }
  });

  // User 모델과 1:N 관계 (작성자)
  Post.associate = models => {
    Post.belongsTo(models.User, { foreignKey: 'userId' });
  };

  return Post;
};
