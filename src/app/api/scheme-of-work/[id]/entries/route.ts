import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-middleware';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth(request);
    if (auth instanceof NextResponse) return auth;
    if (!auth.role || !['SUPER_ADMIN', 'SCHOOL_ADMIN', 'DIRECTOR', 'TEACHER'].includes(auth.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { entries } = body;

    if (!Array.isArray(entries) || entries.length === 0) {
      return NextResponse.json({ error: 'entries array is required' }, { status: 400 });
    }

    // Verify scheme exists
    const scheme = await db.schemeOfWork.findFirst({ where: { id, deletedAt: null } });
    if (!scheme) {
      return NextResponse.json({ error: 'Scheme of work not found' }, { status: 404 });
    }

    // Bulk update entries
    const updatedEntries = await db.$transaction(
      entries.map((entry: {
        id?: string;
        weekNumber: number;
        topic: string;
        subTopic?: string;
        learningObjectives?: string;
        teachingActivities?: string;
        learningActivities?: string;
        resources?: string;
        assessmentMethod?: string;
        duration?: number;
        status?: string;
        completedAt?: string | null;
      }) => {
        if (entry.id) {
          return db.schemeOfWorkEntry.update({
            where: { id: entry.id },
            data: {
              weekNumber: entry.weekNumber,
              topic: entry.topic,
              subTopic: entry.subTopic || null,
              learningObjectives: entry.learningObjectives || null,
              teachingActivities: entry.teachingActivities || null,
              learningActivities: entry.learningActivities || null,
              resources: entry.resources || null,
              assessmentMethod: entry.assessmentMethod || null,
              duration: entry.duration || null,
              status: entry.status || 'pending',
              completedAt: entry.completedAt ? new Date(entry.completedAt) : null,
            },
          });
        }
        return db.schemeOfWorkEntry.create({
          data: {
            schemeOfWorkId: id,
            weekNumber: entry.weekNumber,
            topic: entry.topic,
            subTopic: entry.subTopic || null,
            learningObjectives: entry.learningObjectives || null,
            teachingActivities: entry.teachingActivities || null,
            learningActivities: entry.learningActivities || null,
            resources: entry.resources || null,
            assessmentMethod: entry.assessmentMethod || null,
            duration: entry.duration || null,
            status: entry.status || 'pending',
            completedAt: entry.completedAt ? new Date(entry.completedAt) : null,
          },
        });
      })
    );

    return NextResponse.json({ data: updatedEntries, message: 'Entries updated' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
