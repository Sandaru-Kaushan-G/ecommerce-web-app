const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');
const Coupon = require('./models/Coupon');

dotenv.config();

const sampleProducts = [
  {
    title: 'Wireless Gaming Mouse',
    price: 4500,
    stock: 15,
    category: 'Electronics',
    imageUrl: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400'
  },
  {
    title: 'Mechanical Keyboard RGB',
    price: 12500,
    stock: 8,
    category: 'Electronics',
    imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400'
  },
  {
    title: 'Casual Cotton Hoodie',
    price: 3800,
    stock: 20,
    category: 'Clothing',
    imageUrl: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=400'
  }
];

const sampleCoupons = [
  {
    code: 'SAVE10',
    discountType: 'PERCENTAGE',
    discountValue: 10,
    minOrderValue: 2000,
    validUntil: new Date('2030-01-01')
  },
  {
    code: 'FLAT500',
    discountType: 'FLAT',
    discountValue: 500,
    minOrderValue: 3000,
    validUntil: new Date('2030-01-01')
  }
];

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    await Product.deleteMany();
    await Coupon.deleteMany();

    await Product.insertMany(sampleProducts);
    await Coupon.insertMany(sampleCoupons);

    console.log('Sample Products & Coupons Seeded Successfully!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

seedData();