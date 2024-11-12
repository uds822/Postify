const mongoose = require('mongoose');

// MongoDB Atlas connection string
const uri = "mongodb+srv://postify:postify123@postify.4ifvc.mongodb.net/miniproject?retryWrites=true&w=majority";

// Connect to MongoDB Atlas
mongoose.connect(uri)
  .then(() => {
    console.log("Connected to MongoDB Atlas!");
  })
  .catch((err) => {
    console.log("Error connecting to MongoDB Atlas:", err);
  });

// Define the user schema
const userSchema = mongoose.Schema({
  username: String,
  name: String,
  age: Number,
  email: String,
  password: String,
  profileImage: String, // Add this line for profile image
  posts: [{ type: mongoose.Schema.Types.ObjectId, ref: "post" }]
});

// Export the user model
module.exports = mongoose.model('user', userSchema);
