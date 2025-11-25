import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Category from '@/lib/models/Category';
import ActivityLog from '@/lib/models/ActivityLog';
import { requireAuth } from "@/lib/auth-middleware";

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth(request);
    if (session instanceof NextResponse) return session;

    await connectDB();
    const categories = await Category.find().lean();

    await ActivityLog.create({
      userId: session.user.id,
      username: session.user.username,
      email: session.user.email,
      action: 'export',
      targetType: 'category',
      details: { count: categories.length }
    });

    return NextResponse.json({
      success: true,
      data: categories,
      exportedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json(
      { message: 'Failed to export data' },
      { status: 500 }
    );
  }
}