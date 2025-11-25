//api/categories/[id]
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Category from '@/lib/models/Category';
import ActivityLog from '@/lib/models/ActivityLog';
import { requireAuth } from '@/lib/auth-middleware';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params; // FIXED
    await connectDB();
    
    const category = await Category.findOne({ id }).lean();
    
    if (!category) {
      return NextResponse.json(
        { message: 'Category not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      category
    });
  } catch (error) {
    console.error('Error fetching category:', error);
    return NextResponse.json(
      { message: 'Failed to fetch category' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params; // FIXED
    const session = await requireAuth(request);
    if (session instanceof NextResponse) return session;
    
    await connectDB();
    const body = await request.json();
    
    const category = await Category.findOneAndUpdate(
      { id },
      { $set: body },
      { new: true, runValidators: true }
    );

    if (!category) {
      return NextResponse.json(
        { message: 'Category not found' },
        { status: 404 }
      );
    }

    await ActivityLog.create({
      userId: session.user.id,
      username: session.user.username,
      email: session.user.email, // FIXED
      action: 'update',
      targetType: 'category',
      targetId: category.id,
      details: { updates: Object.keys(body) }
    });

    return NextResponse.json({
      success: true,
      category
    });
  } catch (error) {
    console.error('Error updating category:', error);
    return NextResponse.json(
      { message: 'Failed to update category' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params; // FIXED
    const session = await requireAuth(request);
    if (session instanceof NextResponse) return session;

    await connectDB();
    
    const category = await Category.findOneAndDelete({ id });

    if (!category) {
      return NextResponse.json(
        { message: 'Category not found' },
        { status: 404 }
      );
    }

    await ActivityLog.create({
      userId: session.user.id,
      username: session.user.username,
      email: session.user.email, // FIXED
      action: 'delete',
      targetType: 'category',
      targetId: id,
      details: { name: category.name }
    });

    return NextResponse.json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json(
      { message: 'Failed to delete category' },
      { status: 500 }
    );
  }
}