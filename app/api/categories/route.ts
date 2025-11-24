//api/categories
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Category from '@/lib/models/Category';
import ActivityLog from '@/lib/models/ActivityLog';
import { requireAuth } from "@/lib/auth-middleware";

// GET all categories
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const categories = await Category.find()
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      categories
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { message: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

// POST - Create new category
export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth(request);
    if (session instanceof NextResponse) return session;

    await connectDB();
    
    const body = await request.json();
    
    const category = await Category.create({
      id: body.id || `cat-${Date.now()}`,
      name: body.name,
      description: body.description,
      subcategories: body.subcategories || []
    });

    // Log activity
    await ActivityLog.create({
      userId: session.user.id,
      username: session.user.username,
      action: 'create',
      targetType: 'category',
      targetId: category.id,
      details: { name: category.name }
    });

    return NextResponse.json({
      success: true,
      category
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { message: 'Failed to create category' },
      { status: 500 }
    );
  }
}