const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/copyexpressclaremont', {
}).then(async () => {
  console.log('Connected to MongoDB');

  // Define User schema (simplified)
  const userSchema = new mongoose.Schema({
    username: String,
    email: String,
    role: String
  });

  const User = mongoose.model('User', userSchema);

  // Find the test user
  const user = await User.findOne({ email: 'test3@example.com' });

  if (user) {
    console.log('User found:', user.username, 'Role:', user.role);
  } else {
    console.log('User not found');
  }

  mongoose.connection.close();
}).catch(err => {
  console.error('Connection error:', err);
});
