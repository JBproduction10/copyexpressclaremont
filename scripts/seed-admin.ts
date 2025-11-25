// scripts/seedPricingData.ts
import dotenv from "dotenv";
dotenv.config({ path: ".env"});

import mongoose from 'mongoose';
import Category from '../lib/models/Category';
import { pricingCategories } from '../data/pricingData';

const MONGODB_URI = process.env.MONGODB_URI!;

async function seedPricingData() {
  try {
    console.log('🌱 Starting pricing data seed...');
    
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing categories (optional - comment out if you want to preserve existing data)
    // await Category.deleteMany({});
    // console.log('🗑️  Cleared existing categories');

    // Seed all categories from pricingData.ts
    const results = await Promise.all(
      pricingCategories.map(async (category) => {
        const existingCategory = await Category.findOne({ id: category.id });
        
        if (existingCategory) {
          // Update existing category
          const updated = await Category.findOneAndUpdate(
            { id: category.id },
            { $set: category },
            { new: true, runValidators: true }
          );
          console.log(`✅ Updated category: ${category.name}`);
          return updated;
        } else {
          // Create new category
          const created = await Category.create(category);
          console.log(`✅ Created category: ${category.name}`);
          return created;
        }
      })
    );

    console.log(`\n🎉 Seed completed successfully!`);
    console.log(`📊 Total categories processed: ${results.length}`);
    console.log(`📋 Total subcategories: ${results.reduce((acc, cat) => acc + (cat?.subcategories?.length || 0), 0)}`);
    
  } catch (error) {
    console.error('❌ Error seeding pricing data:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

seedPricingData()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });