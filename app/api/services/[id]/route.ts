// app/api/services/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Service from "@/lib/models/Service";
import ActivityLog from "@/lib/models/ActivityLog";
import { requireAuth } from "@/lib/auth-middleware";

// GET single service
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params; // FIXED: Await params
        await connectDB();
        
        const service = await Service.findOne({ id }).lean();
        
        if (!service) {
            return NextResponse.json(
                { message: 'Service not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            service
        });
    } catch (error) {
        console.error('Error fetching service:', error);
        return NextResponse.json(
            { message: 'Failed to fetch service' },
            { status: 500 }
        );
    }
}

// PUT - Update service
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params; // FIXED: Await params
        const session = await requireAuth(request);
        if (session instanceof NextResponse) return session;

        await connectDB();

        const body = await request.json();

        const service = await Service.findOneAndUpdate(
            { id },
            { $set: body },
            { new: true, runValidators: true }
        );

        if (!service) {
            return NextResponse.json(
                { message: 'Service not found' },
                { status: 404 }
            );
        }

        // FIXED: Added email field from session
        await ActivityLog.create({
            userId: session.user.id,
            username: session.user.username,
            email: session.user.email, // ADDED
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
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params; // FIXED: Await params
        const session = await requireAuth(request);
        if (session instanceof NextResponse) return session;

        await connectDB();
        
        const service = await Service.findOneAndDelete({ id });

        if (!service) {
            return NextResponse.json(
                { message: 'Service not found' },
                { status: 404 }
            );
        }

        // FIXED: Added email field from session
        await ActivityLog.create({
            userId: session.user.id,
            username: session.user.username,
            email: session.user.email,
            action: 'delete',
            targetType: 'service',
            targetId: id,
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