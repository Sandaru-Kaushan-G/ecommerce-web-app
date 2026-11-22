const mongoose = require('mongoose');
const bootstrapSuperAdmin = require('./bootstrap');

const connectDB = async () => {
  const connection = mongoose.connection;

  connection.on('connected', () => console.log('MongoDB connection established'));
  connection.on('error', (error) => console.error(`MongoDB connection error: ${error.message}`));
  connection.on('disconnected', () => console.warn('MongoDB connection disconnected'));

  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
      socketTimeoutMS: 45000
    });
    await bootstrapSuperAdmin();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;