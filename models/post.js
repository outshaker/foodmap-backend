'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Post extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Post.belongsTo(models.User, {foreignKey:"user_id"})
      Post.hasMany(models.Picture, { foreignKey:"post_id"})
    }
  };
  Post.init({
    user_id: DataTypes.INTEGER,
    restaurant_id: DataTypes.STRING,
    title: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: true, 
      }
    },
    content: {
      type: DataTypes.TEXT,
      validate: {
        notEmpty: true, 
      }
    },
    views: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    visited_time: { 
      type: DataTypes.DATE,
      validate: {
        notEmpty: true, 
      }
    },
    is_published:{
      type: DataTypes.BOOLEAN,
      defaultValue: 1,
    },
    is_deleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: 0,
    }
  }, {
    sequelize,
    modelName: 'Post',
  });
  return Post;
};