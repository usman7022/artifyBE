const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: '../config.env' });
const User = require('../models/user')

const DB = process.env.DATABASE
mongoose
  .connect(DB)
  .then(() => console.log('DB connection successful!'));

const users = JSON.parse(
  fs.readFileSync(`${__dirname}/user.json`, 'utf-8')
);



const importData = async () => {
  try {
   await User.create(users);
    console.log('Data successfully loaded!');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

// DELETE ALL DATA FROM DB
const deleteData = async () => { 
  try {
    await User.deleteMany();
    console.log('Data successfully deleted!');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}
