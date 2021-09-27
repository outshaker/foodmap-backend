'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('Posts', [{
      user_id: '1',
      restaurant_id: '1',
      title: 'myfirstPost',
      content: '我的第一篇文章。',
      views :5,
      is_deleted:0,
      is_published: 1,
      visited_time: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      user_id: '1',
      restaurant_id: '1',
      title: 'mysecondPost',
      content: '太好ㄘㄨ了吧！',
      views :13,
      is_deleted:0,
      is_published: 1,
      visited_time: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      user_id: '2',
      restaurant_id: '1',
      title: '使用者 2 號的食記',
      content: '你不應該看我覺得有多難吃！因為我沒有公開！',
      views :13,
      is_deleted: 0,
      is_published: 0,
      visited_time: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    }],{});
  },

  down: async (queryInterface, Sequelize) => {
     return queryInterface.bulkDelete('Posts', null, {});
  }
};
