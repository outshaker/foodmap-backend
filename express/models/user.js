'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      User.hasMany(models.Post, { foreignKey : "id"})
    }
  };
  User.init({
    nickname: DataTypes.STRING,
    password: DataTypes.STRING,
    email: DataTypes.STRING,
    user_level: DataTypes.INTEGER,
    picture_url: DataTypes.STRING,
    background_pic_url: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};