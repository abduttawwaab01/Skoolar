import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-middleware';

function isAdmin(role: string | undefined): boolean {
  return !!role && ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'DIRECTOR', 'TEACHER'].includes(role);
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth(request);
    if (auth instanceof NextResponse) return auth;

    const { id } = await params;

    const scheme = await db.schemeOfWork.findFirst({
      where: { id, deletedAt: null },
      include: {
        class: { select: { id: true, name: true, section: true, grade: true } },
        subject: { select: { id: true, name: true, code: true, type: true } },
        term: { select: { id: true, name: true, order: true, startDate: true, endDate: true } },
        academicYear: { select: { id: true, name: true } },
        entries: {
          orderBy: { weekNumber: 'asc' },
          include: {
            _count: { select: { timetableSlots: true } },
          },
        },
      },
    });

    if (!scheme) {
      return NextResponse.json({ error: 'Scheme of work not found' }, { status: 404 });
    }

    return NextResponse.json({ data: scheme });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth(request);
    if (auth instanceof NextResponse) return auth;
    if (!isAdmin(auth.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { title, description, isPublished } = body;

    const updateData: Record<string, unknown> = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (isPublished !== undefined) updateData.isPublished = isPublished;

    const scheme = await db.schemeOfWork.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ data: scheme, message: 'Scheme of work updated' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth(request);
    if (auth instanceof NextResponse) return auth;
    if (!auth.role || !['SUPER_ADMIN', 'SCHOOL_ADMIN', 'DIRECTOR'].includes(auth.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { id } = await params;

    await db.schemeOfWork.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json({ message: 'Scheme of work deleted' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
