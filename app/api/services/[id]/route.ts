//api/services/[id]
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Service from "@/lib/models/Service";
import ActivityLog from "@/lib/models/ActivityLog";
import { requireAuth } from "@/lib/auth-middleware";

// GET single service
export async function GET(
    request: NextRequest,
    {params}: {params: {id: string}}
) {
    try{
        await connectDB();
        
        const service = await Service.findOne({id: params.id}).lean();
        
        if(!service){
            return NextResponse.json(
                {message: 'Service not found'},
                {status: 404}
            );
        }

        return NextResponse.json({
            success: true,
            service
        });
    }catch(error){
        console.error('Error fetching service:', error);
        return NextResponse.json(
            {message: 'Failed to fetch service'},
            {status: 500}
        );
    }
}

// PUT - Update service
export async function PUT(
    request: NextRequest,
    {params}: {params: {id: string}}
) {
    try{
        const session = await requireAuth(request);
            if (session instanceof NextResponse) return session;

        await connectDB();

        const body = await request.json();

        const service = await Service.findOneAndUpdate(
            {id: params.id},
            {$set: body},
            {new: true, runValidators: true}
        );

        if(!service){
            return NextResponse.json(
                {message: 'Service not found'},
                {status: 404}
            );
        }

        // Log activity
        await ActivityLog.create({
            userId: session.user.id,
            username: session.user.username,
            action: 'update',
            targetType: 'service',
            targetId: service.id,
            details: {updates: Object.keys(body)}
        });

        return NextResponse.json({
            success: true,
            service
        });
    }catch(error){
        console.error('Error updating service:', error);
        return NextResponse.json(
            {message: 'Failed to update service'},
            {status: 500}
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