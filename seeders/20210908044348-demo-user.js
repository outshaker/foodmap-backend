'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
     */
    return queryInterface.bulkInsert(
      'Users',
      [
        {
          nickname: 'Johnson',
          username: 'Johnson',
          password: 'Johnson',
          email: '123example@valkmple.com',
          user_level: '1',
          picture_url:
            'https://gravatar.com/avatar/1e51e6a792a7e158d601bd4369dad071?s=400&d=robohash&r=x',
          background_pic_url: '',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          nickname: 'yoyoyoyo',
          username: 'yoyoyoyo',
          password: 'yoyoyoyo',
          email: 'yosdayo@gmail.com',
          user_level: '1',
          picture_url:
            'https://robohash.org/5fa8042761845cdaa20950f704f56103?set=set4&bgset=&size=400x400',
          background_pic_url: '',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {}
    )
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    return queryInterface.bulkDelete('Users', null, {})
  },
}
