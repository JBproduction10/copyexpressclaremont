// api/services/route.ts - Updated
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Service from "@/lib/models/Service";
import ActivityLog from "@/lib/models/ActivityLog";
import { requireAuth } from "@/lib/auth-middleware";

// GET all services (public)
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

// POST - Create new service (authenticated)
export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth(request);
    if (session instanceof NextResponse) return session;

    await connectDB();

    const body = await request.json();

    const service = await Service.create({
      id: body.id || `service-${Date.now()}`,
      icon: body.icon,
      title: body.title,
      description: body.description,
      order: body.order ?? 0,
      isActive: body.isActive ?? true
    });

    // Log activity
    await ActivityLog.create({
      userId: session.user.id,
      username: session.user.username,
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

// ===== api/services/[id]/route.ts - Updated =====
// PUT - Update service
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAuth(request);
    if (session instanceof NextResponse) return session;

    await connectDB();

    const body = await request.json();

    const service = await Service.findOneAndUpdate(
      { id: params.id },
      { $set: body },
      { new: true, runValidators: true }
    );

    if (!service) {
      return NextResponse.json(
        { message: 'Service not found' },
        { status: 404 }
      );
    }

    // Log activity
    await ActivityLog.create({
      userId: session.user.id,
      username: session.user.username,
      action: 'update',
      targetType: 'service',
      targetId: service.id,
      details: { updates: Object.keys(body) }
    });

    return NextResponse.json({
      success: true,
      service
    });
  } catch (error) {
    console.error('Error updating service:', error);
    return NextResponse.json(
      { message: 'Failed to update service' },
      { status: 500 }
    );
  }
}

// DELETE service
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAuth(request);
    if (session instanceof NextResponse) return session;

    await connectDB();

    const service = await Service.findOneAndDelete({ id: params.id });

    if (!service) {
      return NextResponse.json(
        { message: 'Service not found' },
        { status: 404 }
      );
    }

    // Log activity
    await ActivityLog.create({
      userId: session.user.id,
      username: session.user.username,
      action: 'delete',
      targetType: 'service',
      targetId: params.id,
      details: { title: service.title }
    });

    return NextResponse.json({
      success: true,
      message: 'Service deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting service:', error);
    return NextResponse.json(
      { message: 'Failed to delete service' },
      { status: 500 }
    );
  }
}