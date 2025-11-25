// app/api/services/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Service from "@/lib/models/Service";
import ActivityLog from "@/lib/models/ActivityLog";
import { requireAuth } from "@/lib/auth-middleware";

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('active') === 'true';
    const query = activeOnly ? { isActive: true } : {};

    const services = await Service.find(query)
      .sort({ order: 1, createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      services
    });
  } catch (error) {
    console.error('Error fetching services:', error);
    return NextResponse.json(
      { message: 'Failed to fetch services' },
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

    const service = await Service.create({
      id: body.id || `service-${Date.now()}`,
      icon: body.icon || 'Printer',
      title: body.title,
      description: body.description,
      order: body.order ?? 0,
      isActive: body.isActive ?? true
    });

    await ActivityLog.create({
      userId: session.user.id,
      username: session.user.username,
      email: session.user.email, // FIXED: Added email
      action: 'create',
      targetType: 'service',
      targetId: service.id,
      details: { title: service.title }
    });

    return NextResponse.json({
      success: true,
      service
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating service:', error);
    return NextResponse.json(
      { message: 'Failed to create service' },
      { status: 500 }
    );
  }
}