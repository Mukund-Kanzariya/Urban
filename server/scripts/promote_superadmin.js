/**
 * ServiceHub - Super Admin Promotion Script
 * -----------------------------------------
 * This script allows you to manually promote an existing user account
 * to the 'super_admin' role in your local MongoDB database.
 * 
 * Usage:
 * node server/scripts/promote_superadmin.js <email_address>
 */

const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const User = require('../models/User');

const email = process.argv[2];

if (!email) {
  console.error('\x1b[31mError: Please provide an email address.\x1b[00m');
  console.log('Usage: node server/scripts/promote_superadmin.js user@example.com');
  process.exit(1);
}

const promote = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB...');

    const user = await User.findOne({ email });
    if (!user) {
      console.error(`\x1b[31mError: User with email "${email}" not found.\x1b[00m`);
      process.exit(1);
    }

    user.role = 'super_admin';
    await user.save();

    console.log('\x1b[32mSuccess! Account upgraded to Super Admin:\x1b[00m');
    console.log(`Name:  ${user.name}`);
    console.log(`Email: ${user.email}`);
    
    mongoose.connection.close();
  } catch (err) {
    console.error('Connection Error:', err.message);
    process.exit(1);
  }
};

promote();
