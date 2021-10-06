'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class Picture extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Picture.belongsTo(models.Post, { foreignKey: 'id' })
    }
  }
  Picture.init(
    {
      post_id: DataTypes.INTEGER,
      restaurant_id: DataTypes.STRING,
      food_picture_url: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: 'Picture',
    }
  )
  return Picture
}
