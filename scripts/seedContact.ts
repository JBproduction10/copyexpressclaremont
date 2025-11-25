// scripts/seedContact.ts
import dotenv from "dotenv";
dotenv.config({ path: ".env" });

import mongoose from 'mongoose';
import Contact from '../lib/models/Contact';

const MONGODB_URI = process.env.MONGODB_URI!;

const defaultContact = {
  title: 'Get a Free Quote',
  subtitle: 'Contact Information',
  description: 'Ready to bring your printing project to life? Contact us today for a free, no-obligation quote.',
  contactInfo: [
    {
      id: 'location',
      icon: 'MapPin',
      title: 'Location',
      details: 'SHOP 7, INTABA BUILDING, VINEYARD ROAD, CLAREMONT',
      order: 0
    },
    {
      id: 'phone',
      icon: 'Phone',
      title: 'Phone',
      details: '+27 (0) 21 140 3228',
      order: 1
    },
    {
      id: 'whatsapp',
      icon: 'FaWhatsapp',
      title: 'WhatsApp',
      details: '+27 66 292 4870',
      order: 2
    },
    {
      id: 'email',
      icon: 'Mail',
      title: 'Email',
      details: 'info@copyexpressclaremont.com',
      order: 3
    },
    {
      id: 'hours',
      icon: 'Clock',
      title: 'Hours',
      details: 'Mon-Fri: 08:30AM-5:30PM',
      order: 4
    },
    {
      id: 'weekend',
      icon: 'Clock',
      title: 'Weekend',
      details: 'Sat: 09:00AM-2:00PM, Sun: 10:00AM-3:00PM',
      order: 5
    }
  ],
  isActive: true
};

async function seedContact() {
  try {
    console.log('🌱 Starting contact seed...');
    
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const existing = await Contact.findOne();
    
    if (existing) {
      await Contact.findByIdAndUpdate(existing._id, { $set: defaultContact });
      console.log('✅ Updated existing contact section');
    } else {
      await Contact.create(defaultContact);
      console.log('✅ Created contact section');
    }

    console.log('\n🎉 Seed completed successfully!');
    
  } catch (error) {
    console.error('❌ Error seeding contact:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

seedContact()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });