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
        img: "https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcSsFecqkOJjIPiBIqc68aRZ6iYukMC93qnsFZN3qOrXUlS-72hTiQMOwqoC9T1kW86WJ5Q3_VZng0HDGl-cMQ4j3CJXQBl4RYohKPU-x14Gy_VWrT_6yb_xTNk&usqp=CAE",
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
        img: "https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcSCSmIlWTTQlN45Y60bX6qbgET69VQiteKKGAKIHrDej6fhOQ2MEsFCgVTfYJDBOz7VbNKKFZ0EBFg5Tuf2bIGQZeWbx-P_BBXQGTMHJGE",
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
