const mongoose = require('mongoose');
const config = require('../env');

const connectDB = async () => {
  try {
    await mongoose.connect(config.mongoUri);
    console.log('MongoDB connected via config');
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

module.exports = connectDB;