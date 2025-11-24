//api/services/reorder
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Service from '@/lib/models/Service';
import ActivityLog from "@/lib/models/ActivityLog";
import { requireAuth } from "@/lib/auth-middleware";

export async function PUT(request:NextRequest){
    try{
        const session = await requireAuth(request);
            if (session instanceof NextResponse) return session;

        await connectDB();

        const {serviceIds} = await request.json();

        // Update order for each service
        const updatePromises= serviceIds.map((id: string, index: number) => 
            Service.findOneAndUpdate(
                {id},
                {order: index},
                {new: true}
            )
        );

        await Promise.all(updatePromises);

        // Log activity
        await ActivityLog.create({
            userId: session.user.id,
            username: session.user.username,
            action: 'update',
            targetType: 'service',
            details: {action: 'reorder', count: serviceIds.length}
        });

        return NextResponse.json(
            {success: true, message: 'Service reordered successfully'}
        );
        
    } catch(error){
        console.error('Error reordering services:', error);
        return NextResponse.json(
            {message: 'Failed to reorder services'},
            {status: 500}
        );
    }
}