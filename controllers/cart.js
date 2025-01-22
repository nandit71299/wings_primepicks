const bcrypt = require("bcrypt");
const dotenv = require("dotenv");
const { Op } = require("sequelize");
dotenv.config();

const { sequelize, Users, Products, Carts, CartItems } = require("../models");

const addToCart = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const user = req.user;
    const { sellerId, productId } = req.params;

    // Check if the user is a customer
    const findUser = await Users.findOne({
      where: {
        id: user.id,
        role: "customer",
      },
    });

    if (!findUser) {
      return res.status(401).send({ success: false, message: "Unauthorized" });
    }

    // Check if the seller exists
    const findSeller = await Users.findOne({
      where: {
        id: sellerId,
        role: "seller",
      },
    });
    if (!findSeller) {
      return res
        .status(404)
        .send({ success: false, message: "Seller not found" });
    }

    // Check if the product exists and belongs to the seller
    const findProduct = await Products.findOne({
      where: {
        id: productId,
        created_by: sellerId,
        isDeleted: false,
        isActive: true,
      },
    });
    if (!findProduct) {
      return res
        .status(404)
        .send({ success: false, message: "Product not found" });
    }

    // Check if the user already has a cart
    let findCart = await Carts.findOne({
      where: {
        user_id: user.id,
      },
    });

    if (!findCart) {
      // If no cart exists, create a new one
      findCart = await Carts.create(
        {
          user_id: user.id,
        },
        { transaction }
      );
    }

    // Check if the product is already in the cart
    let findCartItem = await CartItems.findOne({
      where: {
        cart_id: findCart.id,
        product_id: productId,
      },
    });

    if (findCartItem) {
      // If the product already exists in the cart, increase the quantity
      findCartItem.quantity += 1;
      await findCartItem.save({ transaction });
    } else {
      // If the product doesn't exist in the cart, add it
      await CartItems.create(
        {
          cart_id: findCart.id,
          product_id: productId,
          quantity: 1,
        },
        { transaction }
      );
    }

    // Commit the transaction
    await transaction.commit();

    return res
      .status(200)
      .send({ success: true, message: "Product added to cart" });
  } catch (error) {
    // Rollback transaction in case of error
    await transaction.rollback();
    console.error(error);
    return res
      .status(500)
      .send({ success: false, message: "Internal server error" });
  }
};

const removeFromCart = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const user = req.user;
    const { productId } = req.params;

    // Find the user's cart
    const findCart = await Carts.findOne({
      where: { user_id: user.id },
      transaction, // Ensure the transaction is part of this query
    });

    if (!findCart) {
      return res
        .status(404)
        .send({ success: false, message: "Cart not found" });
    }

    // Find the cart item for the specific product
    const findCartItem = await CartItems.findOne({
      where: { cart_id: findCart.id, product_id: productId },
      transaction, // Include transaction in query
    });

    if (!findCartItem) {
      return res
        .status(404)
        .send({ success: false, message: "Product not found in cart" });
    }

    // If the quantity is greater than 1, decrement it
    if (findCartItem.quantity > 1) {
      await findCartItem.decrement("quantity", { by: 1, transaction });
    } else {
      // Otherwise, remove the cart item completely
      await findCartItem.destroy({ transaction });
    }

    // Commit the transaction
    await transaction.commit();

    return res
      .status(200)
      .send({ success: true, message: "Product removed from cart" });
  } catch (error) {
    // Rollback transaction in case of error
    await transaction.rollback();
    console.error(error);
    return res
      .status(500)
      .send({ success: false, message: "Internal server error" });
  }
};

const getCartItems = async (req, res) => {
  try {
    const user = req.user;

    const findCart = await Carts.findOne({
      where: { user_id: user.id },
      include: [
        {
          model: CartItems,
          include: [
            {
              model: Products,
              attributes: ["id", "name", "price", "description"],
            },
          ],
        },
      ],
    });

    if (!findCart) {
      return res
        .status(404)
        .send({ success: false, message: "Cart not found" });
    }

    const cartItems = findCart.CartItems.map((cartItem) => {
      return {
        product: cartItem.Product,
        quantity: cartItem.quantity,
      };
    });

    return res.status(200).send({ success: true, cartItems });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .send({ success: false, message: "Internal server error" });
  }
};

module.exports = { addToCart, removeFromCart, getCartItems };
