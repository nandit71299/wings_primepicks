"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
     */
    queryInterface.bulkInsert("Disputes", [
      {
        order_id: 1,
        user_id: 1,
        reason: "Product is not as described",
        status: "open",
      },
      {
        order_id: 1,
        user_id: 1,
        reason: "It's not resolved yet",
        status: "open",
      },
      {
        order_id: 2,
        user_id: 2,
        reason: "Item arrived damaged",
        status: "resolved",
        resolution: "Item has been repaired and will be delivered soon",
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  },
};
