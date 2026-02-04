const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/fieldtracker';
    console.log('Connecting to MongoDB...');

    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    console.error('');
    console.error('===========================================');
    console.error('Please ensure MongoDB is running!');
    console.error('');
    console.error('Options:');
    console.error('1. Start MongoDB locally: mongod');
    console.error('2. Use MongoDB Atlas: Update MONGO_URI in .env');
    console.error('   Example: mongodb+srv://user:pass@cluster.mongodb.net/fieldtracker');
    console.error('===========================================');
    console.error('');
    console.error('The server will continue running but database operations will fail.');
  }
};

module.exports = connectDB;

