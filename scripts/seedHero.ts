// scripts/seedHero.ts
import dotenv from "dotenv";
dotenv.config({ path: ".env" });

import mongoose from 'mongoose';
import Hero from '../lib/models/Hero';

const MONGODB_URI = process.env.MONGODB_URI!;

const defaultHero = {
  title: 'CopyExpress',
  highlightedText: 'Claremont',
  subtitle: 'Your One-Stop Print Shop for Everything from Lamination to Custom Apparel',
  primaryButtonText: 'Get a Quote',
  primaryButtonAction: 'contact',
  secondaryButtonText: 'Our Services',
  secondaryButtonAction: 'services',
  backgroundImage: '/copyexpresshero.jpeg',
  isActive: true
};

async function seedHero() {
  try {
    console.log('🌱 Starting hero seed...');
    
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const existing = await Hero.findOne();
    
    if (existing) {
      await Hero.findByIdAndUpdate(existing._id, { $set: defaultHero });
      console.log('✅ Updated existing hero section');
    } else {
      await Hero.create(defaultHero);
      console.log('✅ Created hero section');
    }

    console.log('\n🎉 Seed completed successfully!');
    
  } catch (error) {
    console.error('❌ Error seeding hero:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

seedHero()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });