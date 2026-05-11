import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-middleware';

// POST /api/staff-attendance/checkin - Self check-in via school QR scan
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (auth instanceof NextResponse) return auth;

    const body = await request.json();
    const { qrData, location } = body;

    if (!qrData) {
      return NextResponse.json({ error: 'QR data is required' }, { status: 400 });
    }

    let parsedData: any;
    try {
      parsedData = typeof qrData === 'string' ? JSON.parse(qrData) : qrData;
    } catch (e) {
      return NextResponse.json({ error: 'Invalid QR code data' }, { status: 400 });
    }

    // Verify it's a school attendance QR
    if (parsedData.type !== 'school_attendance' || !parsedData.schoolId) {
      return NextResponse.json({ error: 'Invalid QR code type for check-in' }, { status: 400 });
    }

    // Verify staff belongs to this school
    if (auth.schoolId !== parsedData.schoolId) {
      return NextResponse.json({ error: 'You do not belong to this school' }, { status: 403 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });

    // Mark attendance in StaffAttendance
    const attendance = await db.staffAttendance.upsert({
      where: {
        schoolId_userId_date: {
          schoolId: auth.schoolId!,
          userId: auth.userId!,
          date: today,
        },
      },
      update: {
        status: 'present',
        checkInTime: timeStr,
        method: 'self_scan',
        remarks: location ? `Scanned at ${location}` : 'Self-scan at entrance',
        markedBy: auth.userId,
      },
      create: {
        schoolId: auth.schoolId!,
        userId: auth.userId!,
        date: today,
        status: 'present',
        checkInTime: timeStr,
        method: 'self_scan',
        remarks: location ? `Scanned at ${location}` : 'Self-scan at entrance',
        markedBy: auth.userId,
      },
    });

    // Also log the scan
    await db.attendanceScanLog.create({
      data: {
        schoolId: auth.schoolId!,
        userId: auth.userId!,
        scanType: 'self_scan',
        action: 'attendance',
        status: 'success',
        scannedBy: auth.userId,
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('remote-addr') || null,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Check-in successful',
      data: attendance,
    });
  } catch (error: unknown) {
    console.error('Self Check-in API Error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
