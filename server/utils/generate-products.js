const faker = require('faker');
const Product = require('../models/productModel');

// Generate random products
const products = [];

for (let i = 0; i < 10; i++) {
  const product = new Product({
    title: faker.commerce.productName(),
    desc: faker.commerce.productDescription(),
    img: faker.image.imageUrl(),
    categories: [faker.commerce.department()],
    size: [faker.random.arrayElement(['S', 'M', 'L', 'XL'])],
    color: [faker.commerce.color()],
    price: faker.commerce.price(),
    inStock: faker.random.boolean(),
  });

  products.push(product);
}

console.log(products);
