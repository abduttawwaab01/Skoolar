import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { db } from '@/lib/db';
import QRCode from 'qrcode';

// GET /api/staff/qr - Get staff member's attendance QR code
export async function GET(request: NextRequest) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only staff and school admin/super admin can access
    if (!['TEACHER', 'SCHOOL_ADMIN', 'SUPER_ADMIN'].includes(token.role || '')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const staffId = searchParams.get('staffId');

    // Determine which staff member to generate QR for
    let targetStaffId = staffId;
    if (!staffId && token.role === 'TEACHER') {
      // Teachers can only get their own QR
      targetStaffId = token.userId;
    } else if (!staffId && (token.role === 'SCHOOL_ADMIN' || token.role === 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'staffId is required for admins' }, { status: 400 });
    }

    // Fetch staff data
    const staff = await db.teacher.findUnique({
      where: { id: targetStaffId },
      include: {
        user: { select: { name: true, email: true } },
      },
    });

    if (!staff) {
      return NextResponse.json({ error: 'Staff not found' }, { status: 404 });
    }

    // Verify school access
    if (token.role !== 'SUPER_ADMIN' && staff.schoolId !== token.schoolId) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Generate QR code data
    const qrData = JSON.stringify({
      type: 'staff',
      id: staff.employeeNo,
      userId: staff.userId,
      personId: staff.id,
      schoolId: staff.schoolId,
      name: staff.user?.name || staff.name,
      role: 'STAFF',
      timestamp: Date.now(),
    });

    // Generate QR code as base64 PNG
    const qrBuffer = await QRCode.toBuffer(qrData, {
      width: 256,
      margin: 2,
      color: {
        dark: '#059669',
        light: '#FFFFFF',
      },
    });

    return new NextResponse(qrBuffer.toString('base64'), {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
