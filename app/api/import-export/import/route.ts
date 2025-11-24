/* eslint-disable @typescript-eslint/no-explicit-any */
//api/import-export/import
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Category from '@/lib/models/Category';
import ActivityLog from '@/lib/models/ActivityLog';
import { requireAuth } from '@/lib/auth-middleware';

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth(request);
        if (session instanceof NextResponse) return session;

    await connectDB();
    
    const { categories, replaceAll } = await request.json();

    let result;
    
    if (replaceAll) {
      // Delete all existing categories and insert new ones
      await Category.deleteMany({});
      result = await Category.insertMany(categories);
    } else {
      // Upsert categories
      result = await Promise.all(
        categories.map((cat: any) =>
          Category.findOneAndUpdate(
            { id: cat.id },
            cat,
            { upsert: true, new: true }
          )
        )
      );
    }

    // Log activity
    await ActivityLog.create({
      userId: session.user.id,
      username: session.user.username,
      action: 'import',
      targetType: 'category',
      details: { 
        count: categories.length,
        replaceAll 
      }
    });

    return NextResponse.json({
      success: true,
      message: `Successfully imported ${categories.length} categories`,
      count: categories.length
    });
  } catch (error) {
    console.error('Import error:', error);
    return NextResponse.json(
      { message: 'Failed to import data' },
      { status: 500 }
    );
  }
}