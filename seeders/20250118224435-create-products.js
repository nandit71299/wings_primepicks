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
    await queryInterface.bulkInsert("Products", [
      {
        name: "Iphone 14",
        category_id: 1,
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        price: 19.99,
        available_quantity: 100,
        isDeleted: false,
        createdAt: Sequelize.fn("NOW"),
        updatedAt: Sequelize.fn("NOW"),
      },
      {
        name: "Adidas Black Edition Sweat Shirt",
        category_id: 2,
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        price: 14.99,
        available_quantity: 50,
        isDeleted: false,
        createdAt: Sequelize.fn("NOW"),
        updatedAt: Sequelize.fn("NOW"),
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
