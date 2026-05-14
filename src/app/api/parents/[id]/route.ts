import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-middleware';
import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 12;

// GET /api/parents/[id] - Get a single parent by ID
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAuth(request);
    if (auth instanceof NextResponse) return auth;
    const { id } = await params;

    const parent = await db.parent.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true, isActive: true } },
        parentStudents: {
          include: {
            student: {
              select: { id: true, admissionNo: true, user: { select: { name: true } }, class: { select: { name: true } } },
            },
          },
        },
      },
    });

    if (!parent) {
      return NextResponse.json({ error: 'Parent not found' }, { status: 404 });
    }

    // School isolation
    if (auth.role !== 'SUPER_ADMIN' && auth.schoolId && parent.schoolId !== auth.schoolId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    return NextResponse.json({ data: parent });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// PUT /api/parents/[id] - Update a parent
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAuth(request);
    if (auth instanceof NextResponse) return auth;
    const { id } = await params;

    if (!['SCHOOL_ADMIN', 'TEACHER', 'SUPER_ADMIN'].includes(auth.role || '')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const parent = await db.parent.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!parent) {
      return NextResponse.json({ error: 'Parent not found' }, { status: 404 });
    }

    // School isolation
    if (auth.role !== 'SUPER_ADMIN' && auth.schoolId && parent.schoolId !== auth.schoolId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const { name, email, phone, occupation, password } = body;

    // Update User record
    const userUpdateData: Record<string, unknown> = {};
    if (name !== undefined) userUpdateData.name = name;
    if (email !== undefined) {
      // Check email uniqueness (exclude current user)
      const existingUser = await db.user.findFirst({
        where: { email: email.toLowerCase(), deletedAt: null, id: { not: parent.userId } },
      });
      if (existingUser) {
        return NextResponse.json({ error: 'A user with this email already exists' }, { status: 409 });
      }
      userUpdateData.email = email.toLowerCase();
    }
    if (phone !== undefined) userUpdateData.phone = phone || null;
    if (password) {
      if (password.length < 6) {
        return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
      }
      userUpdateData.password = await bcrypt.hash(password, SALT_ROUNDS);
    }

    if (Object.keys(userUpdateData).length > 0) {
      await db.user.update({ where: { id: parent.userId }, data: userUpdateData });
    }

    // Update Parent record
    const parentUpdateData: Record<string, unknown> = {};
    if (occupation !== undefined) parentUpdateData.occupation = occupation || null;
    if (phone !== undefined) parentUpdateData.phone = phone || null;

    if (Object.keys(parentUpdateData).length > 0) {
      await db.parent.update({ where: { id }, data: parentUpdateData });
    }

    // Fetch updated parent
    const updated = await db.parent.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true, isActive: true } },
      },
    });

    return NextResponse.json({ data: updated, message: 'Parent updated successfully' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// DELETE /api/parents/[id] - Hard delete a parent (removes Parent + User records)
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAuth(request);
    if (auth instanceof NextResponse) return auth;
    const { id } = await params;

    if (!['SCHOOL_ADMIN', 'SUPER_ADMIN'].includes(auth.role || '')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const parent = await db.parent.findUnique({
      where: { id },
    });

    if (!parent) {
      return NextResponse.json({ error: 'Parent not found' }, { status: 404 });
    }

    // School isolation
    if (auth.role !== 'SUPER_ADMIN' && auth.schoolId && parent.schoolId !== auth.schoolId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Delete related StudentParent records first
    await db.studentParent.deleteMany({ where: { parentId: id } });

    // Delete the Parent record
    await db.parent.delete({ where: { id } });

    // Hard delete the User record
    await db.user.delete({ where: { id: parent.userId } });

    return NextResponse.json({ message: 'Parent permanently deleted' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
