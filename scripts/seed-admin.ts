/* eslint-disable @typescript-eslint/no-explicit-any */
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
        
        // Process subcategories to ensure image galleries have proper structure
        const processedCategory = {
          ...category,
          subcategories: category.subcategories.map(sub => {
            if (sub.type === 'image-gallery' && sub.images) {
              return {
                ...sub,
                images: sub.images.map(img => ({
                  ...img,
                  // Ensure publicId is set (empty for initial seed, will be filled on upload)
                  publicId: img.publicId || ''
                }))
              };
            }
            return sub;
          })
        };
        
        if (existingCategory) {
          // Update existing category
          const updated = await Category.findOneAndUpdate(
            { id: category.id },
            { $set: processedCategory },
            { new: true, runValidators: true }
          );
          console.log(`✅ Updated category: ${category.name}`);
          return updated;
        } else {
          // Create new category
          const created = await Category.create(processedCategory);
          console.log(`✅ Created category: ${category.name}`);
          return created;
        }
      })
    );

    console.log(`\n🎉 Seed completed successfully!`);
    console.log(`📊 Total categories processed: ${results.length}`);
    console.log(`📋 Total subcategories: ${results.reduce((acc, cat) => acc + (cat?.subcategories?.length || 0), 0)}`);
    
    // Count image galleries
    const imageGalleries = results.reduce((acc, cat) => {
      return acc + (cat?.subcategories?.filter((sub: any) => sub.type === 'image-gallery').length || 0);
    }, 0);
    console.log(`🖼️  Total image galleries: ${imageGalleries}`);
    
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