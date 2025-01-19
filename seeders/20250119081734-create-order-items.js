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
    await queryInterface.bulkInsert("OrderItems", [
      {
        order_id: 1,
        product_id: 1,
        quantity: 1,
        subtotal: 19.99,
        tax: 2,
        total: 21.99,
      },
      {
        order_id: 1,
        product_id: 2,
        quantity: 1,
        subtotal: 14.99,
        tax: 2,
        total: 16.99,
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
