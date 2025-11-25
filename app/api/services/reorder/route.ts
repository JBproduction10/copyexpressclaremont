// app/api/services/reorder/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Service from "@/lib/models/Service";
import ActivityLog from "@/lib/models/ActivityLog";
import { requireAuth } from "@/lib/auth-middleware";

export async function PUT(request: NextRequest) {
  try {
    const session = await requireAuth(request);
    if (session instanceof NextResponse) return session;

    await connectDB();
    const { serviceIds } = await request.json();

    if (!Array.isArray(serviceIds)) {
      return NextResponse.json(
        { message: 'serviceIds must be an array' },
        { status: 400 }
      );
    }

    const updatePromises = serviceIds.map((id: string, index: number) =>
      Service.findOneAndUpdate(
        { id },
        { order: index },
        { new: true }
      )
    );

    await Promise.all(updatePromises);

    await ActivityLog.create({
      userId: session.user.id,
      username: session.user.username,
      email: session.user.email, // FIXED: Added email
      action: 'reorder',
      targetType: 'service',
      details: { action: 'reorder', count: serviceIds.length }
    });

    return NextResponse.json({
      success: true,
      message: 'Services reordered successfully'
    });
  } catch (error) {
    console.error('Error reordering services:', error);
    return NextResponse.json(
      { message: 'Failed to reorder services' },
      { status: 500 }
    );
  }
}