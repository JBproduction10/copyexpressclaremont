import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Contact, { IContact } from '@/lib/models/Contact';
import ActivityLog from '@/lib/models/ActivityLog';
import { requireAuth } from '@/lib/auth-middleware';
import { Types, FlattenMaps } from 'mongoose';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('active') === 'true';
    
    let contact = await Contact.findOne(activeOnly ? { isActive: true } : {})
      .sort({ createdAt: -1 })
      .lean() as (FlattenMaps<IContact> & Required<{ _id: Types.ObjectId }> & { __v: number }) | null;

    if (!contact) {
      contact = (await Contact.create({
        title: 'Get a Free Quote',
        subtitle: 'Contact Information',
        description: 'Ready to bring your printing project to life? Contact us today for a free, no-obligation quote.',
        contactInfo: [
          {
            id: 'location',
            icon: 'MapPin',
            title: 'Location',
            details: 'SHOP 7, INTABA BUILDING, VINEYARD ROAD, CLAREMONT',
            order: 0
          },
          {
            id: 'phone',
            icon: 'Phone',
            title: 'Phone',
            details: '+27 (0) 21 140 3228',
            order: 1
          },
          {
            id: 'whatsapp',
            icon: 'FaWhatsapp',
            title: 'WhatsApp',
            details: '+27 66 292 4870',
            order: 2
          },
          {
            id: 'email',
            icon: 'Mail',
            title: 'Email',
            details: 'info@copyexpressclaremont.com',
            order: 3
          },
          {
            id: 'hours',
            icon: 'Clock',
            title: 'Hours',
            details: 'Mon-Fri: 08:30AM-5:30PM',
            order: 4
          },
          {
            id: 'weekend',
            icon: 'Clock',
            title: 'Weekend',
            details: 'Sat: 09:00AM-2:00PM, Sun: 10:00AM-3:00PM',
            order: 5
          }
        ],
        isActive: true
      })).toObject() as FlattenMaps<IContact> & Required<{ _id: Types.ObjectId }> & { __v: number };
    }

    return NextResponse.json({
      success: true,
      contact
    });
  } catch (error) {
    console.error('Error fetching contact:', error);
    return NextResponse.json(
      { message: 'Failed to fetch contact content' },
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
    
    let contact = await Contact.findOne().sort({ createdAt: -1 }).lean() as (FlattenMaps<IContact> & Required<{ _id: Types.ObjectId }> & { __v: number }) | null;
    
    if (!contact) {
      const createdContact = await Contact.create(body);
      contact = createdContact.toObject() as FlattenMaps<IContact> & Required<{ _id: Types.ObjectId }> & { __v: number };
    } else {
      contact = await Contact.findByIdAndUpdate(
        contact._id,
        { $set: body },
        { new: true, runValidators: true }
      ).lean() as FlattenMaps<IContact> & Required<{ _id: Types.ObjectId }> & { __v: number };
    }

    await ActivityLog.create({
      userId: session.user.id,
      username: session.user.username,
      email: session.user.email,
      action: 'update',
      targetType: 'contact',
      targetId: contact._id.toString(),
      details: { updates: Object.keys(body) }
    });

    return NextResponse.json({
      success: true,
      contact
    });
  } catch (error) {
    console.error('Error updating contact:', error);
    return NextResponse.json(
      { message: 'Failed to update contact content' },
      { status: 500 }
    );
  }
}