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
        created_by: 3,
        status: "Pending Approval",
        img: "https://res.cloudinary.com/dcitebicp/image/upload/v1732100843/cld-sample-5.jpg",
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
        created_by: 3,
        status: "Approved",
        img: "https://res.cloudinary.com/dcitebicp/image/upload/v1732100843/cld-sample-5.jpg",
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
