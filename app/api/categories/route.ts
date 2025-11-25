/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/categories/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Category from '@/lib/models/Category';
import ActivityLog from '@/lib/models/ActivityLog';
import { requireAuth } from "@/lib/auth-middleware";

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '4');
    const search = searchParams.get('search') || '';
    
    const query: any = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    const total = await Category.countDocuments(query);
    const categories = await Category.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return NextResponse.json({
      success: true,
      categories,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { message: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

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

    await ActivityLog.create({
      userId: session.user.id,
      username: session.user.username,
      email: session.user.email, // FIXED: Added email
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