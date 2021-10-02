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
    return queryInterface.bulkInsert('Posts', [
      {
        user_id: '1',
        restaurant_id: 'ChIJc5vdqtvkZzQRyC46UNgY6Mg',
        title: '苦古牛空相笑耳休別道',
        content: `實升出打那眼門拍買，借棵愛吹；色良西休。包口請丁百，學王這幼雲魚馬隻福用戶是鼻兌裝豆飽元，母信士央每着千目。土止王助共浪太雲古包語雪早。對科升跟友。
        直功功苦空不布別怕法過黃到雄夏幫太？再鴨坡前路到百禾請百天哭巾司手里高肉米鴨，沒和記點象候海婆邊幼笑買？浪下春事有左足安晚公樹片聲打車蝴：活枝至錯彩父借片就尾或呢告每朋什：拍間常女寸衣主友松口。`,
        views: 5,
        is_deleted: 0,
        is_published: 1,
        visited_time: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        user_id: '1',
        restaurant_id: 'ChIJc5vdqtvkZzQRyC46UNgY6Mg',
        title: '菜月畫學忍吃蛋那荷',
        content: `兆員娘師尾怪公門瓜呀虎！美聽以一音掃兔坡斗加怪晚。許回朵石相樹眼同個過着這苦爪原「二老」錯朋做每鳥出往家放害！小請位。

        長喜詞勿男喜朵冒十古林去祖方奶山掃珠少：經坡錯師記棵加止連問石美口世法封抓壯旦，兒火巾鴨虎。乙父日爪想玩向蝴昌加水，活做中瓜。`,
        views: 5,
        is_deleted: 0,
        is_published: 1,
        visited_time: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        user_id: '2',
        restaurant_id: 'ChIJc5vdqtvkZzQRyC46UNgY6Mg',
        title: '忍吃蛋那荷',
        content: `許回朵石相樹眼同個過着這苦爪原「二老」錯朋做每鳥出往家放害！小請位。

        長喜詞勿男喜朵冒十古林去祖方奶山掃珠少：經坡錯師記棵加止連問石美口世法封抓壯旦，兒火巾鴨虎。乙父日爪想玩向蝴昌加水，活做中瓜。`,
        views: 5,
        is_deleted: 0,
        is_published: 1,
        visited_time: new Date(),
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
    return queryInterface.bulkDelete('Posts', null, {})
  },
}
