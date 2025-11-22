import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Admin from "@/lib/models/Admin";
import PricingCategory from "@/lib/models/PricingCategory";
import { pricingCategories } from "@/data/pricingData";

export async function POST(){
    try{
        await connectDB();

        // Check if already seeded
        const existingCategories = await PricingCategory.countDocuments();
        const existingAdmin = await Admin.countDocuments();

        if(existingCategories > 0 || existingAdmin > 0){
            return NextResponse.json(
                {
                    success: false,
                    error: 'Database already seeded. Clear the database first if you want to re-seed.',
                },
                {
                    status: 400
                }
            );
        }

        // Create admin user
        const admin = await Admin.create({
            email: process.env.ADMIN_EMAIL || 'admin@copyexpress.com',
            password: process.env.ADMIN_PASSWORD || 'ChangeMeInProduction123!',
            name: 'Admin User',
        });

        // Seed pricing categories
        const categories = await PricingCategory.insertMany(pricingCategories);

        return NextResponse.json({
            success: true,
            message: 'Database seeded successfully',
            data:{
                admin: {
                    email: admin.email,
                    name: admin.name,
                },
                categoriesCount: categories.length,
            },
        });
    }catch(error: unknown){
        console.error('Error seeding database:', error);
        return NextResponse.json(
            {success: false, error: 'Failed to seed database'},
            {status: 500}
        );
    }
}

// DELETE - Clear all data (use with caution!)
export async function DELETE(){
    try{
        await connectDB();

        await Admin.deleteMany({});

        return NextResponse.json({
            success: true,
            message: 'Database cleared successfully',
        });
    } catch(error: unknown){
        console.error('Error clearing database:', error);
        return NextResponse.json(
            {success: false, error: 'Failed to clear database'},
            {status: 500}
        )
    }
}
