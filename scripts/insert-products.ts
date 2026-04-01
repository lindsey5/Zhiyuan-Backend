import mongoose from "mongoose";
import Product from "../models/Product";
import Variant from "../models/Variant";
import dotenv from 'dotenv';
dotenv.config();

const productsData = [
    {
      "product_name": "1BY1 BILLMAGIC HARD BAG ",
      "description": "<p>1BY1 BILLMAGIC HARD BAG FOR CUE STICK</p>",
      "thumbnail_public_id": "products/nu8u4tmnt5u07w0wvrbr",
      "thumbnail_url": "https://res.cloudinary.com/dm7ujqhka/image/upload/v1774696611/products/nu8u4tmnt5u07w0wvrbr.jpg",
      "category": "Billiard Bag",
      "variants": [
        {
          "variant_name": "BLACK 2.0",
          "image_url": "https://res.cloudinary.com/dm7ujqhka/image/upload/v1774696614/products/fnbiwb0y1l0jhfsgvcgc.jpg",
          "image_public_id": "products/fnbiwb0y1l0jhfsgvcgc",
          "stock": 10,
          "price": 690,
          "sku": "Bag-Black2.0",
        },
        {
          "variant_name": "BILLMAGIC WHITE",
          "image_url": "https://res.cloudinary.com/dm7ujqhka/image/upload/v1774696615/products/n5gqnu0h4w55pp6qaw9d.jpg",
          "image_public_id": "products/n5gqnu0h4w55pp6qaw9d",
          "stock": 10,
          "price": 690,
          "sku": "Bag-Billmagicwhite",
        },
        {
          "variant_name": "PINK BAG 2.0",
          "image_url": "https://res.cloudinary.com/dm7ujqhka/image/upload/v1774696615/products/nmzkvqlzfg4jhzmyyf26.jpg",
          "image_public_id": "products/nmzkvqlzfg4jhzmyyf26",
          "stock": 10,
          "price": 690,
          "sku": "Bag-Pinkbag2.0",
        }
      ]
    },
    {
      "product_name": "BUDGET FRIENDLY CUESTICKS FOR BILLIARD | PLAYING CUE",
      "description": "<p>Enhance your billiards experience with our Budget Cue Stick. Perfect for beginner players, this cue stick offers an excellent blend of quality, performance, and affordability.<br></p><p><strong>Why Choose Our Budget Cue Stick?</strong></p><p>This cue stick is designed to provide an exceptional playing experience without the high price tag. Ideal for casual play at home or competitive matches, it delivers reliability and performance that you can trust.</p><p><strong>Customer Satisfaction</strong></p><p>Join countless satisfied customers who have improved their game with our Budget Cue Stick.</p>",
      "thumbnail_public_id": "products/ybvqpaaprdiglgggrfvg",
      "thumbnail_url": "https://res.cloudinary.com/dm7ujqhka/image/upload/v1774630702/products/ybvqpaaprdiglgggrfvg.jpg",
      "category": "Billiard Cue Sticks",
      "variants": [
        {
          "variant_name": "CHESS ORANGE 12.5",
          "image_url": "https://res.cloudinary.com/dm7ujqhka/image/upload/v1774630703/products/gy58u9ky1nct4kmkybhp.webp",
          "image_public_id": "products/gy58u9ky1nct4kmkybhp",
          "stock": 20,
          "price": 1650,
          "sku": "STICK-CHESS-ORANGE-12.5",
        },
        {
          "variant_name": "CHESS RED 12.5",
          "image_url": "https://res.cloudinary.com/dm7ujqhka/image/upload/v1774630704/products/supkjiaxn7y4henn5pte.webp",
          "image_public_id": "products/supkjiaxn7y4henn5pte",
          "stock": 50,
          "price": 1650,
          "sku": "STICK-CHESS-RED",
        },
        {
          "variant_name": "CHESS PURLE 12.5",
          "image_url": "https://res.cloudinary.com/dm7ujqhka/image/upload/v1774630704/products/g8slgrpasrkqfnedc41i.webp",
          "image_public_id": "products/g8slgrpasrkqfnedc41i",
          "stock": 10,
          "price": 1650,
          "sku": "STICK-CHESS-PURPLE",
        },
        {
          "variant_name": "MONARCH BROWN 12.5",
          "image_url": "https://res.cloudinary.com/dm7ujqhka/image/upload/v1774630704/products/u3help6gjan68fs5l8tw.webp",
          "image_public_id": "products/u3help6gjan68fs5l8tw",
          "stock": 20,
          "price": 1650,
          "sku": "STICK-MONARCH-BROWN",
        },
        {
          "variant_name": "EMPEROR WHITE 12.5",
          "image_url": "https://res.cloudinary.com/dm7ujqhka/image/upload/v1774630704/products/audkqmuuritqj9qwsznp.webp",
          "image_public_id": "products/audkqmuuritqj9qwsznp",
          "stock": 20,
          "price": 1650,
          "sku": "STICK-EMPEROR-WHITE",
        },
        {
          "variant_name": "JANGUAR PINK 12.5",
          "image_url": "https://res.cloudinary.com/dm7ujqhka/image/upload/v1774630936/products/qptocovwz1nhsr7lbstu.webp",
          "image_public_id": "products/qptocovwz1nhsr7lbstu",
          "stock": 30,
          "price": 851,
          "sku": "STICK-JANGUAR-PINK",
        },
        {
          "variant_name": "401 PINK COATED 11.5",
          "image_url": "https://res.cloudinary.com/dm7ujqhka/image/upload/v1774630937/products/e6qwbqgdnyvcbha3xnp0.webp",
          "image_public_id": "products/e6qwbqgdnyvcbha3xnp0",
          "stock": 20,
          "price": 1650,
          "sku": "STICK-PINK-COATED",
        }
      ]
    },
    {
      "product_name": "KONLLEN KL SERIES CUE STICKS",
      "description": "<p><strong>KONLLEN KL SERIES CUE STICKS</strong></p><p></p>",
      "thumbnail_public_id": "products/ffq61rtwh2pgcr04wzm6",
      "thumbnail_url": "https://res.cloudinary.com/dm7ujqhka/image/upload/v1774634492/products/ffq61rtwh2pgcr04wzm6.webp",
      "category": "Billiard Cue Sticks",
      "variants": [
        {
          "variant_name": "AK-15YF",
          "image_url": "https://res.cloudinary.com/dm7ujqhka/image/upload/v1774634494/products/uf0wot1to1wx82dc6vtw.webp",
          "image_public_id": "products/uf0wot1to1wx82dc6vtw",
          "stock": 10,
          "price": 17103,
          "sku": "STICK-AK-15YF",
        },
        {
          "variant_name": "AK-15WBG",
          "image_url": "https://res.cloudinary.com/dm7ujqhka/image/upload/v1774634494/products/nlfab1halz2xrbillrod.webp",
          "image_public_id": "products/nlfab1halz2xrbillrod",
          "stock": 10,
          "price": 17103,
          "sku": "STICK-AK-15WBG",
        },
        {
          "variant_name": "KL10-09F",
          "image_url": "https://res.cloudinary.com/dm7ujqhka/image/upload/v1774634495/products/hitzuiwho3jvqgkf5jt9.webp",
          "image_public_id": "products/hitzuiwho3jvqgkf5jt9",
          "stock": 7,
          "price": 17103,
          "sku": "STICK-KL10-09F",
        }
      ]
    },
    {
      "product_name": "PERI LCBA",
      "description": "<p>PERI LCBA Cue stick </p>",
      "thumbnail_public_id": "products/xtp2pw2vfxkctwlgvml7",
      "thumbnail_url": "https://res.cloudinary.com/dm7ujqhka/image/upload/v1774695619/products/xtp2pw2vfxkctwlgvml7.jpg",
      "category": "Peri Products",
      "variants": [
        {
          "variant_name": "LCBA",
          "image_url": "https://res.cloudinary.com/dm7ujqhka/image/upload/v1774695620/products/bctrrjaipoxcaemtrv4c.jpg",
          "image_public_id": "products/bctrrjaipoxcaemtrv4c",
          "stock": 5,
          "price": 5055,
          "sku": "Stick-LCBA1",
        }
      ]
    }
  ]

async function insertProducts() {
  try {
    await mongoose.connect(process.env.MONGO_URI || "");
    console.log("Database connected.");

    for (const product of productsData) {
      const existingProduct = await Product.findOne({ product_name: product.product_name, status: 'active' });

      if (existingProduct) {
        console.log(`Product with name ${product.product_name} already exists. Skipping...`);
        continue;
      }

      const { variants, ...productFields } = product;

      // Create product
      const createdProduct = await Product.create(productFields);

      // Create all variants for this product
      for (const variant of variants) {
        const existingVariant = await Variant.findOne({ sku: variant.sku });

        if (existingVariant) {
          console.log(`Variant with SKU ${variant.sku} already exists. Skipping...`);
          continue;
        }

        await Variant.create({
          ...variant,
          product_id: createdProduct._id,
        });
      }
    }

    console.log("Products and variants inserted successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error inserting products:", error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

insertProducts();