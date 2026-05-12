import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-middleware';

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (auth instanceof NextResponse) return auth;

    const { searchParams } = new URL(request.url);
    const schoolId = searchParams.get('schoolId') || auth.schoolId;
    const subjectId = searchParams.get('subjectId');
    const classId = searchParams.get('classId');
    const status = searchParams.get('status');
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')));

    if (!schoolId) {
      return NextResponse.json({ error: 'School ID is required' }, { status: 400 });
    }

    const where: Record<string, unknown> = { schoolId };
    if (subjectId) where.subjectId = subjectId;
    if (classId) where.classId = classId;
    if (status) where.status = status;

    const [data, total] = await Promise.all([
      db.lessonPlan.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { updatedAt: 'desc' },
        include: {
          subject: { select: { id: true, name: true, code: true } },
          class: { select: { id: true, name: true, section: true } },
        },
      }),
      db.lessonPlan.count({ where }),
    ]);

    return NextResponse.json({ data, total, page, totalPages: Math.ceil(total / limit) });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (auth instanceof NextResponse) return auth;
    if (!auth.role || !['SUPER_ADMIN', 'SCHOOL_ADMIN', 'DIRECTOR', 'TEACHER'].includes(auth.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const { schoolId: rawSchoolId, subjectId, classId, topic, objectives, activities, resources, status } = body;

    const schoolId = rawSchoolId || auth.schoolId;
    if (!schoolId || !topic) {
      return NextResponse.json({ error: 'schoolId and topic are required' }, { status: 400 });
    }

    const plan = await db.lessonPlan.create({
      data: {
        schoolId,
        subjectId: subjectId || null,
        classId: classId || null,
        teacherId: auth.id!,
        topic,
        objectives: objectives || null,
        activities: activities || null,
        resources: resources || null,
        status: status || 'draft',
      },
      include: {
        subject: { select: { id: true, name: true, code: true } },
        class: { select: { id: true, name: true, section: true } },
      },
    });

    return NextResponse.json({ data: plan, message: 'Lesson plan created' }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
