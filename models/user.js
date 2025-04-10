const mongoose = require("mongoose"); 
var Schema = mongoose.Schema;

const bcrypt = require('bcrypt');
const userSchema = new mongoose.Schema({ 
    firstName: {type: String, required: true}, 
    lastName: {type: String, required: true},
    email: {type: String, required: true, unique: true}, 
    password: {type: String, required: true},
    isAdmin: { type: Boolean, default: false }
});

const User = mongoose.model("User", userSchema, 'users'); 

(async () => {
  try {
    const adminEmail = 'luanvo.10042004@gmail.com';
    const adminUser = await User.findOne({ email: adminEmail });
    if (!adminUser) {
      const newAdmin = new User({
        firstName: 'Admin',
        lastName: 'User',
        email: adminEmail,
        password: await bcrypt.hash('defaultpassword', 10), 
        isAdmin: true
      });
      await newAdmin.save();
      console.log('Default admin user created successfully');
    } else if (!adminUser.isAdmin) {
      adminUser.isAdmin = true;
      await adminUser.save();
      console.log('Default admin user updated successfully');
    }
  } catch (err) {
    console.error('Error setting default admin user:', err);
  }
})();

module.exports = User;