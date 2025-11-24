//scripts
import mongoose from 'mongoose';
import User from '../lib/models/User';

const MONGODB_URI = process.env.MONGODB_URI!;

async function seedAdmin() {
  try {
    console.log('🌱 Starting admin seed...');
    
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check if admin exists
    const existingAdmin = await User.findOne({ username: 'admin' });
    
    if (existingAdmin) {
      console.log('ℹ️  Admin user already exists');
      console.log('   Username:', existingAdmin.username);
      console.log('   Email:', existingAdmin.email);
      console.log('   Role:', existingAdmin.role);
      
      // Update password if needed
      existingAdmin.password = 'admin123';
      await existingAdmin.save();
      console.log('✅ Admin password reset to: admin123');
    } else {
      // Create admin user
      const admin = await User.create({
        username: 'admin',
        email: 'admin@copyexpress.com',
        password: 'admin123',
        role: 'admin',
        isActive: true
      });

      console.log('✅ Admin user created successfully:');
      console.log('   Username:', admin.username);
      console.log('   Email:', admin.email);
      console.log('   Password: admin123');
      console.log('   Role:', admin.role);
    }

    console.log('\n🎉 Seed completed successfully!');
    console.log('\nYou can now login with:');
    console.log('Username: admin');
    console.log('Password: admin123');
    
  } catch (error) {
    console.error('❌ Error seeding admin:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

seedAdmin()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });