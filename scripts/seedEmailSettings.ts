// scripts/seedEmailSettings.ts
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Define schema inline
const EmailSettingsSchema = new mongoose.Schema({
  smtpHost: { type: String, required: true, default: 'smtp.gmail.com' },
  smtpPort: { type: Number, required: true, default: 587 },
  smtpSecure: { type: Boolean, default: false },
  smtpUser: { type: String, required: true },
  smtpPassword: { type: String, required: true },
  fromEmail: { type: String, required: true },
  fromName: { type: String, required: true, default: 'CopyExpress Claremont' },
  replyToEmail: { type: String, required: true },
  adminEmail: { type: String, required: true },
  customerSubject: { type: String, default: 'We received your quote request - CopyExpress Claremont' },
  adminSubject: { type: String, default: 'New Quote Request from {name}' },
  isActive: { type: Boolean, default: true },
  testMode: { type: Boolean, default: false },
  lastModifiedBy: String
}, { timestamps: true });

const EmailSettings = mongoose.models.EmailSettings || 
  mongoose.model('EmailSettings', EmailSettingsSchema);

async function seedEmailSettings() {
  try {
    const MONGODB_URI = process.env.MONGODB_URI;
    
    if (!MONGODB_URI) {
      throw new Error('MONGODB_URI not found in environment variables');
    }

    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check if settings already exist
    const existingSettings = await EmailSettings.findOne({ isActive: true });
    
    if (existingSettings) {
      console.log('⚠️  Email settings already exist. Skipping seed.');
      console.log('Current settings:', {
        smtpUser: existingSettings.smtpUser,
        fromEmail: existingSettings.fromEmail,
        adminEmail: existingSettings.adminEmail,
      });
      return;
    }

    // Get credentials from environment
    const emailUser = process.env.EMAIL_USER;
    const emailPassword = process.env.EMAIL_PASSWORD;
    const adminEmail = process.env.ADMIN_EMAIL || emailUser;

    if (!emailUser || !emailPassword) {
      throw new Error('EMAIL_USER and EMAIL_PASSWORD must be set in .env file');
    }

    // Create initial email settings
    const settings = await EmailSettings.create({
      smtpHost: 'smtp.gmail.com',
      smtpPort: 587,
      smtpSecure: false,
      smtpUser: emailUser,
      smtpPassword: emailPassword,
      fromEmail: emailUser,
      fromName: 'CopyExpress Claremont',
      replyToEmail: emailUser,
      adminEmail: adminEmail,
      customerSubject: 'We received your quote request - CopyExpress Claremont',
      adminSubject: 'New Quote Request from {name}',
      isActive: true,
      testMode: false,
      lastModifiedBy: 'system'
    });

    console.log('✅ Email settings created successfully!');
    console.log({
      smtpHost: settings.smtpHost,
      smtpPort: settings.smtpPort,
      smtpUser: settings.smtpUser,
      fromEmail: settings.fromEmail,
      adminEmail: settings.adminEmail,
    });

  } catch (error) {
    console.error('❌ Error seeding email settings:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

seedEmailSettings()
  .then(() => {
    console.log('🎉 Email settings seed completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Seed failed:', error);
    process.exit(1);
  });