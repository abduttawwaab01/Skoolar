import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-middleware';

// POST /api/attendance/scan - Log QR scan for attendance
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (auth instanceof NextResponse) return auth;

    const body = await request.json();
    const { qrData, scanType = 'attendance', scannedBy, schoolId } = body;

    if (!qrData) {
      return NextResponse.json({ error: 'QR data is required' }, { status: 400 });
    }

    let parsedData: any;
    try {
      parsedData = typeof qrData === 'string' ? JSON.parse(qrData) : qrData;
    } catch (e) {
      return NextResponse.json({ error: 'Invalid QR code data' }, { status: 400 });
    }

    const { type, id: cardId, userId: targetUserId, personId, schoolId: qrSchoolId, name, role, timestamp } = parsedData;

    // Validation: We need either a personId (for students/teachers) or a userId (for other staff/admins)
    if ((!personId && !targetUserId) || !schoolId) {
      return NextResponse.json({ error: 'QR code missing required fields' }, { status: 400 });
    }

    // Verify school matches user's school unless SUPER_ADMIN
    const userSchoolId = auth.schoolId;
    const targetSchoolId = auth.role === 'SUPER_ADMIN' ? (schoolId || qrSchoolId) : userSchoolId;

    if (auth.role !== 'SUPER_ADMIN' && qrSchoolId !== userSchoolId) {
      return NextResponse.json({ error: 'QR code does not belong to your school' }, { status: 403 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });

    // 1. Identify the person being scanned
    let person: any = null;
    let finalUserId: string | null = null;
    let isStudent = false;

    if (type === 'student') {
      person = await db.student.findUnique({
        where: { id: personId },
        include: { user: { select: { id: true, name: true, role: true } }, class: { select: { id: true, name: true } } },
      });
      if (person) {
        finalUserId = person.userId;
        isStudent = true;
      }
    } else {
      // It's staff (Teacher, Accountant, Librarian, Director, or Admin)
      // First try by userId if provided (for Admin/generic staff)
      if (targetUserId) {
        person = await db.user.findUnique({
          where: { id: targetUserId },
          include: { 
            teacherProfile: { select: { id: true, employeeNo: true } },
            accountantProfile: { select: { id: true, employeeNo: true } },
            librarianProfile: { select: { id: true, employeeNo: true } },
            directorProfile: { select: { id: true, employeeNo: true } },
          }
        });
        if (person) finalUserId = person.id;
      } 
      // Then try by teacherId (backward compatibility for old QR codes)
      else if (personId) {
        const teacher = await db.teacher.findUnique({
          where: { id: personId },
          include: { user: { select: { id: true, name: true, role: true } } }
        });
        if (teacher) {
          person = teacher.user;
          finalUserId = teacher.userId;
        }
      }
    }

    if (!person || !finalUserId) {
      return NextResponse.json({ error: 'Person not found' }, { status: 404 });
    }

    // 2. Record scan in AttendanceScanLog
    const scanLog = await db.attendanceScanLog.create({
      data: {
        schoolId: targetSchoolId,
        studentId: isStudent ? personId : null,
        teacherId: (!isStudent && type === 'staff' && personId) ? personId : null,
        userId: finalUserId,
        cardId: cardId || null,
        scanType: scanType,
        action: scanType === 'attendance' || scanType === 'staff_attendance' ? 'attendance' : scanType,
        status: 'success',
        scannedBy: scannedBy || auth.userId,
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('remote-addr') || null,
      },
    });

    // 3. Process Attendance
    if (scanType === 'attendance' || scanType === 'staff_attendance') {
      if (isStudent) {
        // --- Student Attendance Logic ---
        const currentTerm = await db.term.findFirst({
          where: {
            schoolId: targetSchoolId,
            startDate: { lte: today },
            endDate: { gte: today },
            isLocked: false,
          },
          orderBy: { startDate: 'desc' },
        });

        if (currentTerm) {
          await db.attendance.upsert({
            where: {
              schoolId_studentId_date: {
                schoolId: targetSchoolId,
                studentId: personId,
                date: today,
              },
            },
            update: {
              status: 'present',
              classId: person.classId,
              termId: currentTerm.id,
              method: 'qr_scan',
              markedBy: scannedBy || auth.userId,
            },
            create: {
              schoolId: targetSchoolId,
              studentId: personId,
              classId: person.classId,
              termId: currentTerm.id,
              date: today,
              status: 'present',
              method: 'qr_scan',
              markedBy: scannedBy || auth.userId,
            },
          });
        }
      } else {
        // --- Staff Attendance Logic ---
        await db.staffAttendance.upsert({
          where: {
            schoolId_userId_date: {
              schoolId: targetSchoolId,
              userId: finalUserId,
              date: today,
            },
          },
          update: {
            status: 'present',
            checkInTime: timeStr,
            method: 'qr_scan',
            markedBy: scannedBy || auth.userId,
          },
          create: {
            schoolId: targetSchoolId,
            userId: finalUserId,
            date: today,
            status: 'present',
            checkInTime: timeStr,
            method: 'qr_scan',
            markedBy: scannedBy || auth.userId,
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        scanLog,
        person: {
          name: isStudent ? person.user.name : person.name,
          id: isStudent ? person.admissionNo : (person.teacherProfile?.employeeNo || person.accountantProfile?.employeeNo || person.id.slice(0, 8)),
          role: isStudent ? 'STUDENT' : person.role,
        },
      },
      message: 'Attendance recorded successfully',
    });
  } catch (error: unknown) {
    console.error('Scan API Error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
