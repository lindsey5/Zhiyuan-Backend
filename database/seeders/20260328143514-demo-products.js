'use strict';

const productsData = [
  {
    "product_name": "1BY1 BILLMAGIC HARD BAG ",
    "description": "<p>1BY1 BILLMAGIC HARD BAG FOR CUE STICK</p>",
    "thumbnail_public_id": "products/nu8u4tmnt5u07w0wvrbr",
    "thumbnail_url": "https://res.cloudinary.com/dm7ujqhka/image/upload/v1774696611/products/nu8u4tmnt5u07w0wvrbr.jpg",
    "category": "Billiard Bag",
  },
  {
    "product_name": "BUDGET FRIENDLY CUESTICKS FOR BILLIARD | PLAYING CUE",
    "description": "<p>Enhance your billiards experience with our Budget Cue Stick. Perfect for beginner players, this cue stick offers an excellent blend of quality, performance, and affordability.<br></p><p><strong>Why Choose Our Budget Cue Stick?</strong></p><p>This cue stick is designed to provide an exceptional playing experience without the high price tag. Ideal for casual play at home or competitive matches, it delivers reliability and performance that you can trust.</p><p><strong>Customer Satisfaction</strong></p><p>Join countless satisfied customers who have improved their game with our Budget Cue Stick.</p>",
    "thumbnail_public_id": "products/ybvqpaaprdiglgggrfvg",
    "thumbnail_url": "https://res.cloudinary.com/dm7ujqhka/image/upload/v1774630702/products/ybvqpaaprdiglgggrfvg.jpg",
    "category": "Billiard Cue Sticks",
  },
  {
    "product_name": "KONLLEN KL SERIES CUE STICKS",
    "description": "<p><strong>KONLLEN KL SERIES CUE STICKS</strong></p><p></p>",
    "thumbnail_public_id": "products/ffq61rtwh2pgcr04wzm6",
    "thumbnail_url": "https://res.cloudinary.com/dm7ujqhka/image/upload/v1774634492/products/ffq61rtwh2pgcr04wzm6.webp",
    "category": "Billiard Cue Sticks",
  },
  {
    "product_name": "PERI LCBA",
    "description": "<p>PERI LCBA Cue stick </p>",
    "thumbnail_public_id": "products/xtp2pw2vfxkctwlgvml7",
    "thumbnail_url": "https://res.cloudinary.com/dm7ujqhka/image/upload/v1774695619/products/xtp2pw2vfxkctwlgvml7.jpg",
    "category": "Peri Products",
    }
]

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('products', productsData, {});
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  }
};
