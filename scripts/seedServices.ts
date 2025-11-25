// scripts/seedServices.ts
import dotenv from "dotenv";
dotenv.config({ path: ".env" });

import mongoose from 'mongoose';
import Service from '../lib/models/Service';

const MONGODB_URI = process.env.MONGODB_URI!;

const defaultServices = [
  {
    id: 'service-1',
    icon: 'Printer',
    title: 'Digital Printing',
    description: 'High-quality digital printing for all your document needs, from business cards to posters.',
    order: 0,
    isActive: true
  },
  {
    id: 'service-2',
    icon: 'Shield',
    title: 'Lamination',
    description: 'Professional lamination services to protect and preserve your important documents.',
    order: 1,
    isActive: true
  },
  {
    id: 'service-3',
    icon: 'Shirt',
    title: 'Apparel Printing',
    description: 'Custom t-shirt printing, hoodies, and more with vibrant, long-lasting designs.',
    order: 2,
    isActive: true
  },
  {
    id: 'service-4',
    icon: 'Coffee',
    title: 'Utensils Printing',
    description: 'Personalized utensils (mugs, coasters, plates, etc...) perfect for gifts, promotions, or special occasions.',
    order: 3,
    isActive: true
  },
  {
    id: 'service-5',
    icon: 'Sticker',
    title: 'Custom Stickers',
    description: 'Eye-catching stickers in any shape, size, or design for branding or fun.',
    order: 4,
    isActive: true
  },
  {
    id: 'service-6',
    icon: 'FileText',
    title: 'Large Format',
    description: 'Banners, posters, and signage in any size for events and displays.',
    order: 5,
    isActive: true
  },
  {
    id: 'service-7',
    icon: 'Scissors',
    title: 'Die Cutting',
    description: 'Precision cutting services for custom shapes and professional finishing.',
    order: 6,
    isActive: true
  },
  {
    id: 'service-8',
    icon: 'Sparkles',
    title: 'Special Finishes',
    description: 'Premium finishes including binding, embossing, foiling, and spot UV coating.',
    order: 7,
    isActive: true
  }
];

async function seedServices() {
  try {
    console.log('🌱 Starting services seed...');
    
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing services (optional)
    // await Service.deleteMany({});
    // console.log('🗑️  Cleared existing services');

    // Seed services
    const results = await Promise.all(
      defaultServices.map(async (service) => {
        const existing = await Service.findOne({ id: service.id });
        
        if (existing) {
          const updated = await Service.findOneAndUpdate(
            { id: service.id },
            { $set: service },
            { new: true, runValidators: true }
          );
          console.log(`✅ Updated service: ${service.title}`);
          return updated;
        } else {
          const created = await Service.create(service);
          console.log(`✅ Created service: ${service.title}`);
          return created;
        }
      })
    );

    console.log(`\n🎉 Seed completed successfully!`);
    console.log(`📊 Total services processed: ${results.length}`);
    
  } catch (error) {
    console.error('❌ Error seeding services:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

seedServices()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });