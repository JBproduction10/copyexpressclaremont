import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import About, { IAbout } from '@/lib/models/About';
import ActivityLog from '@/lib/models/ActivityLog';
import { requireAuth } from "@/lib/auth-middleware";
import { Types, FlattenMaps } from 'mongoose';

// GET about content
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('active') === 'true';
    
  let about = await About.findOne(activeOnly ? { isActive: true } : {})
    .sort({ createdAt: -1 })
    .lean() as (FlattenMaps<IAbout> & Required<{ _id: Types.ObjectId }> & { __v: number }) | null;

  // If no about section exists, create default one
  if (!about) {
    about = (await About.create({
      title: 'Why Choose',
      subtitle: 'CopyExpress Claremont?',
      highlightedText: 'CopyExpress Claremont',
      mainDescription: 'With years of experience in the printing industry, CopyExpress Claremont has become the trusted choice for businesses and individuals throughout the community.',
      features: [
        { id: 'f1', text: 'Fast turnaround times', order: 0 },
        { id: 'f2', text: 'Competitive pricing', order: 1 },
        { id: 'f3', text: 'Professional quality', order: 2 },
        { id: 'f4', text: 'Expert customer service', order: 3 },
        { id: 'f5', text: 'Latest printing technology', order: 4 },
        { id: 'f6', text: 'Custom solutions', order: 5 }
      ],
      statisticNumber: '35+',
      statisticLabel: 'Years',
      statisticSubtext: 'Of Excellence',
      isActive: true
    })).toObject() as FlattenMaps<IAbout> & Required<{ _id: Types.ObjectId }> & { __v: number };
  }

    return NextResponse.json({
      success: true,
      about
    });
  } catch (error) {
    console.error('Error fetching about:', error);
    return NextResponse.json(
      { message: 'Failed to fetch about content' },
      { status: 500 }
    );
  }
}

// PUT - Update about content
export async function PUT(request: NextRequest) {
  try {
    const session = await requireAuth(request);
    if (session instanceof NextResponse) return session;

    await connectDB();
    
    const body = await request.json();
    
  // Find the most recent about section or create one
  let about = await About.findOne().sort({ createdAt: -1 }).lean() as (FlattenMaps<IAbout> & Required<{ _id: Types.ObjectId }> & { __v: number }) | null;
  
  if (!about) {
    const createdAbout = await About.create(body);
    about = createdAbout.toObject() as FlattenMaps<IAbout> & Required<{ _id: Types.ObjectId }> & { __v: number };
  } else {
    about = await About.findByIdAndUpdate(
      about._id,
      { $set: body },
      { new: true, runValidators: true }
    ).lean() as FlattenMaps<IAbout> & Required<{ _id: Types.ObjectId }> & { __v: number };
  }

    // Log activity
    await ActivityLog.create({
      userId: session.user.id,
      username: session.user.username,
      action: 'update',
      targetType: 'about',
      targetId: about._id.toString(),
      details: { updates: Object.keys(body) }
    });

    return NextResponse.json({
      success: true,
      about
    });
  } catch (error) {
    console.error('Error updating about:', error);
    return NextResponse.json(
      { message: 'Failed to update about content' },
      { status: 500 }
    );
  }
}
