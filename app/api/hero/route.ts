// app/api/hero/route.ts - Fixed with cache revalidation
import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import connectDB from '@/lib/mongodb';
import Hero, { IHero } from '@/lib/models/Hero';
import ActivityLog from '@/lib/models/ActivityLog';
import { requireAuth } from '@/lib/auth-middleware';
import { Types, FlattenMaps } from 'mongoose';

export const dynamic = 'force-dynamic'; // CRITICAL: Disable caching

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('active') === 'true';
    
    let hero = await Hero.findOne(activeOnly ? { isActive: true } : {})
      .sort({ createdAt: -1 })
      .lean() as (FlattenMaps<IHero> & Required<{ _id: Types.ObjectId }> & { __v: number }) | null;

    if (!hero) {
      hero = (await Hero.create({
        title: 'CopyExpress',
        highlightedText: 'Claremont',
        subtitle: 'Your One-Stop Print Shop for Everything from Lamination to Custom Apparel',
        primaryButtonText: 'Get a Quote',
        primaryButtonAction: 'contact',
        secondaryButtonText: 'Our Services',
        secondaryButtonAction: 'services',
        backgroundImage: '/copyexpresshero.jpeg',
        isActive: true
      })).toObject() as FlattenMaps<IHero> & Required<{ _id: Types.ObjectId }> & { __v: number };
    }

    return NextResponse.json(
      { success: true, hero },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        }
      }
    );
  } catch (error) {
    console.error('Error fetching hero:', error);
    return NextResponse.json(
      { message: 'Failed to fetch hero content' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await requireAuth(request);
    if (session instanceof NextResponse) return session;

    await connectDB();
    const body = await request.json();
    
    console.log('[API] Updating hero with:', body);
    
    let hero = await Hero.findOne().sort({ createdAt: -1 }).lean() as (FlattenMaps<IHero> & Required<{ _id: Types.ObjectId }> & { __v: number }) | null;
    
    if (!hero) {
      const createdHero = await Hero.create(body);
      hero = createdHero.toObject() as FlattenMaps<IHero> & Required<{ _id: Types.ObjectId }> & { __v: number };
    } else {
      hero = await Hero.findByIdAndUpdate(
        hero._id,
        { $set: body },
        { new: true, runValidators: true }
      ).lean() as FlattenMaps<IHero> & Required<{ _id: Types.ObjectId }> & { __v: number };
    }

    await ActivityLog.create({
      userId: session.user.id,
      username: session.user.username,
      email: session.user.email,
      action: 'update',
      targetType: 'hero',
      targetId: hero._id.toString(),
      details: { updates: Object.keys(body) }
    });

    // CRITICAL: Revalidate Next.js cache
    revalidatePath('/');
    revalidatePath('/api/hero');

    console.log('[API] Hero updated successfully');

    return NextResponse.json(
      { success: true, hero },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        }
      }
    );
  } catch (error) {
    console.error('Error updating hero:', error);
    return NextResponse.json(
      { message: 'Failed to update hero content' },
      { status: 500 }
    );
  }
}