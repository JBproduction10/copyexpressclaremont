// scripts/migrate-stamps-to-db.ts
// Run this script to migrate stamps data from pricingData.ts to MongoDB

import mongoose from 'mongoose';
import Category from '../lib/models/Category';
import { pricingCategories } from '../data/pricingData';

const MONGODB_URI = process.env.MONGODB_URI || 'your-mongodb-uri';

async function migrateStamps() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find the stamps category in pricingData
    const stampsCategory = pricingCategories.find(cat => cat.id === 'stamps');
    
    if (!stampsCategory) {
      console.log('Stamps category not found in pricingData');
      return;
    }

    // Check if stamps already exists in database
    const existingStamps = await Category.findOne({ id: 'stamps' });

    if (existingStamps) {
      console.log('Stamps category already exists. Updating...');
      await Category.updateOne(
        { id: 'stamps' },
        { $set: stampsCategory }
      );
      console.log('Stamps category updated successfully');
    } else {
      console.log('Creating new stamps category...');
      await Category.create(stampsCategory);
      console.log('Stamps category created successfully');
    }

    console.log('\nMigration completed!');
    console.log('Stamps subcategories:', stampsCategory.subcategories.length);
    console.log('Total images:', 
      stampsCategory.subcategories.reduce((sum, sub) => 
        sum + (sub.images?.length || 0), 0
      )
    );

  } catch (error) {
    console.error('Migration error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

migrateStamps();