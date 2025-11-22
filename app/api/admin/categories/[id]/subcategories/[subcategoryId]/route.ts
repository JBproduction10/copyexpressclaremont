import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import PricingCategory from '@/lib/models/PricingCategory';

interface RouteParams {
  params: Promise<{
    id: string;
    subcategoryId: string;
  }>;
}

// PUT update subcategory
export async function PUT(
  req: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();
    const { id, subcategoryId } = await params;
    const body = await req.json();

    const category = await PricingCategory.findOne({ id });

    if (!category) {
      return NextResponse.json(
        { success: false, error: 'Category not found' },
        { status: 404 }
      );
    }

    const subcategoryIndex = category.subcategories.findIndex(
      (sub) => sub.id === subcategoryId
    );

    if (subcategoryIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Subcategory not found' },
        { status: 404 }
      );
    }

    category.subcategories[subcategoryIndex] = {
      ...category.subcategories[subcategoryIndex],
      ...body,
    };

    await category.save();

    return NextResponse.json({
      success: true,
      data: category,
    });
  } catch (error: unknown) {
    console.error('Error updating subcategory:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update subcategory' },
      { status: 500 }
    );
  }
}

// DELETE subcategory
export async function DELETE(
  req: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();
    const { id, subcategoryId } = await params;

    const category = await PricingCategory.findOne({ id });

    if (!category) {
      return NextResponse.json(
        { success: false, error: 'Category not found' },
        { status: 404 }
      );
    }

    category.subcategories = category.subcategories.filter(
      (sub) => sub.id !== subcategoryId
    );

    await category.save();

    return NextResponse.json({
      success: true,
      message: 'Subcategory deleted successfully',
    });
  } catch (error: unknown) {
    console.error('Error deleting subcategory:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete subcategory' },
      { status: 500 }
    );
  }
}
