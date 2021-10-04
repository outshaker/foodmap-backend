'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('Pictures', [
      {
        post_id: '1',
        restaurant_id: 'ChIJc5vdqtvkZzQRyC46UNgY6Mg',
        food_picture_url:
          'https://mochislife.com/wp-content/uploads/20180502084725_40.jpg',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        post_id: '1',
        restaurant_id: 'ChIJc5vdqtvkZzQRyC46UNgY6Mg',
        food_picture_url:
          'https://bnextmedia.s3.hicloud.net.tw/image/album/2019-10/img-1570334675-57182@600.jpg',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        post_id: '2',
        restaurant_id: 'ChIJc5vdqtvkZzQRyC46UNgY6Mg',
        food_picture_url:
          'https://bnextmedia.s3.hicloud.net.tw/image/album/2019-10/img-1570334675-57182@600.jpg',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ])
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    return queryInterface.bulkDelete('Pictures', null, {})
  },
}
