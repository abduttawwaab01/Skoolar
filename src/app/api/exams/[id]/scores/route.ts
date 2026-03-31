import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/exams/[id]/scores - List all scores for an exam
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Verify exam exists
    const exam = await db.exam.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        totalMarks: true,
        passingMarks: true,
        isLocked: true,
        isPublished: true,
        classId: true,
      },
    });

    if (!exam) {
      return NextResponse.json({ error: 'Exam not found' }, { status: 404 });
    }

    const scores = await db.examScore.findMany({
      where: { examId: id },
      include: {
        student: {
          select: {
            id: true,
            admissionNo: true,
            user: { select: { name: true, email: true, avatar: true } },
            class: { select: { name: true, section: true } },
          },
        },
      },
      orderBy: { score: 'desc' },
    });

    // Calculate statistics
    const scoreValues = scores.map((s) => s.score);
    const stats = {
      totalScored: scores.length,
      average: scoreValues.length > 0
        ? Math.round((scoreValues.reduce((a, b) => a + b, 0) / scoreValues.length) * 100) / 100
        : 0,
      highest: scoreValues.length > 0 ? Math.max(...scoreValues) : 0,
      lowest: scoreValues.length > 0 ? Math.min(...scoreValues) : 0,
      passed: scores.filter((s) => s.score >= exam.passingMarks).length,
      failed: scores.filter((s) => s.score < exam.passingMarks).length,
      passRate: scoreValues.length > 0
        ? Math.round((scores.filter((s) => s.score >= exam.passingMarks).length / scoreValues.length) * 100)
        : 0,
    };

    return NextResponse.json({
      data: {
        exam,
        scores,
        stats,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST /api/exams/[id]/scores - Bulk upsert scores
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const { scores } = body;

    if (!scores || !Array.isArray(scores)) {
      return NextResponse.json(
        { error: 'scores array is required' },
        { status: 400 }
      );
    }

    // Verify exam exists and is not locked
    const exam = await db.exam.findUnique({
      where: { id },
    });

    if (!exam) {
      return NextResponse.json({ error: 'Exam not found' }, { status: 404 });
    }

    if (exam.isLocked) {
      return NextResponse.json(
        { error: 'Exam is locked. Unlock it first to modify scores.' },
        { status: 403 }
      );
    }

    const created: unknown[] = [];
    const updated: unknown[] = [];
    const errors: { studentId: string; error: string }[] = [];

    for (const scoreData of scores) {
      if (!scoreData.studentId) {
        errors.push({ studentId: 'unknown', error: 'Missing studentId' });
        continue;
      }

      // Validate student exists
      const student = await db.student.findUnique({
        where: { id: scoreData.studentId },
      });
      if (!student) {
        errors.push({ studentId: scoreData.studentId, error: 'Student not found' });
        continue;
      }

      // Validate score range
      if (scoreData.score < 0 || scoreData.score > exam.totalMarks) {
        errors.push({
          studentId: scoreData.studentId,
          error: `Score must be between 0 and ${exam.totalMarks}`,
        });
        continue;
      }

      // Calculate grade
      const percentage = (scoreData.score / exam.totalMarks) * 100;
      let grade = 'F';
      if (percentage >= 90) grade = 'A+';
      else if (percentage >= 80) grade = 'A';
      else if (percentage >= 70) grade = 'B';
      else if (percentage >= 60) grade = 'C';
      else if (percentage >= 50) grade = 'D';
      else grade = 'F';

      try {
        const result = await db.examScore.upsert({
          where: {
            examId_studentId: {
              examId: id,
              studentId: scoreData.studentId,
            },
          },
          update: {
            score: scoreData.score,
            grade: scoreData.grade || grade,
            remarks: scoreData.remarks || null,
          },
          create: {
            examId: id,
            studentId: scoreData.studentId,
            score: scoreData.score,
            grade: scoreData.grade || grade,
            remarks: scoreData.remarks || null,
          },
        });

        // Check if it was created or updated
        const existingScore = await db.examScore.findFirst({
          where: { examId: id, studentId: scoreData.studentId },
        });
        if (existingScore) {
          updated.push(result);
        } else {
          created.push(result);
        }
      } catch {
        errors.push({ studentId: scoreData.studentId, error: 'Failed to save score' });
      }
    }

    return NextResponse.json({
      data: { created, updated },
      errors: errors.length > 0 ? errors : undefined,
      createdCount: created.length,
      updatedCount: updated.length,
      errorCount: errors.length,
      message: `Scores saved: ${created.length} created, ${updated.length} updated`,
    }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
