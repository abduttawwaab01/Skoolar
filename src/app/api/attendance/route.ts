import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-middleware';

// GET /api/attendance - List attendance records with filters
export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (auth instanceof NextResponse) return auth;

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const schoolId = searchParams.get('schoolId') || '';
    const classId = searchParams.get('classId') || '';
    const termId = searchParams.get('termId') || '';
    const studentId = searchParams.get('studentId') || '';
    const status = searchParams.get('status') || '';
    const dateFrom = searchParams.get('dateFrom') || '';
    const dateTo = searchParams.get('dateTo') || '';
    const groupBy = searchParams.get('groupBy') || '';

    const where: Record<string, unknown> = {};

    // School context validation
    const userSchoolId = auth.schoolId;
    if (userSchoolId) {
      where.schoolId = userSchoolId;
    } else if (schoolId) {
      where.schoolId = schoolId;
    }

    if (classId) where.classId = classId;
    if (termId) where.termId = termId;
    if (studentId) where.studentId = studentId;
    if (status) where.status = status;
    if (dateFrom || dateTo) {
      const dateFilter: Record<string, unknown> = {};
      if (dateFrom) dateFilter.gte = new Date(dateFrom);
      if (dateTo) dateFilter.lte = new Date(dateTo);
      where.date = dateFilter;
    }

    const [data, total] = await Promise.all([
      db.attendance.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { date: 'desc' },
        select: {
          id: true,
          schoolId: true,
          termId: true,
          studentId: true,
          classId: true,
          date: true,
          status: true,
          method: true,
          remarks: true,
          markedBy: true,
          createdAt: true,
          updatedAt: true,
          student: {
            select: {
              id: true,
              admissionNo: true,
              user: { select: { name: true, email: true } },
              class: { select: { name: true, section: true, grade: true } },
            },
          },
          term: {
            select: { id: true, name: true },
          },
        },
      }),
      db.attendance.count({ where }),
    ]);

    return NextResponse.json({
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST /api/attendance - Mark attendance (bulk)
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (auth instanceof NextResponse) return auth;

    if (!['SCHOOL_ADMIN', 'TEACHER', 'SUPER_ADMIN'].includes(auth.role || '')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();

    const { records, schoolId, termId, classId, date, markedBy } = body;

    // School context: use auth's schoolId if user is not SUPER_ADMIN
    const targetSchoolId = auth.role === 'SUPER_ADMIN' && schoolId ? schoolId : (auth.schoolId || schoolId);
    if (!targetSchoolId) {
      return NextResponse.json({ error: 'School ID is required' }, { status: 400 });
    }

    if (!termId || !classId || !date || !records || !Array.isArray(records)) {
      return NextResponse.json(
        { error: 'termId, classId, date, and records array are required' },
        { status: 400 }
      );
    }

    const attendanceDate = new Date(date);
    const created: unknown[] = [];
    const errors: { studentId: string; error: string }[] = [];

    // Validate students belong to the class
    const classStudents = await db.student.findMany({
      where: { classId, deletedAt: null, isActive: true, schoolId: targetSchoolId },
      select: { id: true, admissionNo: true },
    });
    const studentIds = new Set(classStudents.map((s) => s.id));

    for (const record of records) {
      if (!record.studentId || !record.status) {
        errors.push({ studentId: record.studentId || 'unknown', error: 'Missing studentId or status' });
        continue;
      }

      if (!studentIds.has(record.studentId)) {
        errors.push({ studentId: record.studentId, error: 'Student not found in this class' });
        continue;
      }

      try {
        // Upsert attendance (unique constraint on schoolId + studentId + date)
        const attendance = await db.attendance.upsert({
          where: {
            schoolId_studentId_date: {
              schoolId: targetSchoolId,
              studentId: record.studentId,
              date: attendanceDate,
            },
          },
          update: {
            status: record.status,
            classId,
            termId,
            remarks: record.remarks || null,
            method: record.method || 'manual',
            markedBy: markedBy || auth.userId,
          },
          create: {
            schoolId: targetSchoolId,
            termId,
            studentId: record.studentId,
            classId,
            date: attendanceDate,
            status: record.status,
            remarks: record.remarks || null,
            method: record.method || 'manual',
            markedBy: markedBy || auth.userId,
          },
        });
        created.push(attendance);
      } catch {
        errors.push({ studentId: record.studentId, error: 'Failed to save attendance record' });
      }
    }

    return NextResponse.json({
      data: created,
      errors: errors.length > 0 ? errors : undefined,
      createdCount: created.length,
      errorCount: errors.length,
      message: `Attendance marked for ${created.length} students`,
    }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
