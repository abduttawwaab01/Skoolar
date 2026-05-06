import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-middleware';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth(request);
    if (auth instanceof NextResponse) return auth;

    const { id } = await params;

    const timetable = await db.timetable.findUnique({
      where: { id },
    });

    if (!timetable) {
      return NextResponse.json({ error: 'Timetable not found' }, { status: 404 });
    }

    // Get slots for this timetable
    const slots = await db.timetableSlot.findMany({
      where: { timetableId: id },
      orderBy: [{ dayOfWeek: 'asc' }, { period: 'asc' }],
    });

    return NextResponse.json({
      data: timetable,
      slots,
    });
  } catch (error) {
    console.error('Timetable GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch timetable' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth(request);
    if (auth instanceof NextResponse) return auth;

    const { id } = await params;
    const body = await request.json();
    const { name, isActive, isPublished } = body;

    const timetable = await db.timetable.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(isActive !== undefined && { isActive }),
        ...(isPublished !== undefined && { isPublished }),
      },
    });

    return NextResponse.json({
      success: true,
      data: timetable,
    });
  } catch (error) {
    console.error('Timetable PUT error:', error);
    return NextResponse.json({ error: 'Failed to update timetable' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth(request);
    if (auth instanceof NextResponse) return auth;

    const { id } = await params;

    // Soft delete timetable and its slots
    await db.timetable.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    await db.timetableSlot.updateMany({
      where: { timetableId: id },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Timetable DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete timetable' }, { status: 500 });
  }
}