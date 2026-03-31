import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/lessons/[id]/quizzes - List quizzes for a lesson
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const lesson = await db.videoLesson.findUnique({
      where: { id },
      select: { id: true, title: true },
    });

    if (!lesson) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
    }

    const quizzes = await db.lessonQuiz.findMany({
      where: { lessonId: id },
      include: {
        questions: { orderBy: { order: 'asc' } },
        _count: { select: { attempts: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      data: quizzes,
      total: quizzes.length,
      lesson: { id: lesson.id, title: lesson.title },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST /api/lessons/[id]/quizzes - Create a quiz for a lesson
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const { title, timeLimit, passingScore, questions } = body as {
      title: string;
      timeLimit?: number;
      passingScore?: number;
      questions?: {
        type: string;
        questionText: string;
        options?: string[];
        correctAnswer?: string | string[];
        marks?: number;
      }[];
    };

    if (!title) {
      return NextResponse.json({ error: 'Quiz title is required' }, { status: 400 });
    }

    const lesson = await db.videoLesson.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!lesson) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
    }

    const quiz = await db.lessonQuiz.create({
      data: {
        lessonId: id,
        title,
        timeLimit: timeLimit || null,
        passingScore: passingScore || 50,
        questions: {
          create: (questions || []).map((q, index) => ({
            type: q.type || 'MCQ',
            questionText: q.questionText,
            options: q.options ? JSON.stringify(q.options) : null,
            correctAnswer: q.correctAnswer ? JSON.stringify(q.correctAnswer) : null,
            marks: q.marks || 1,
            order: index,
          })),
        },
      },
      include: {
        questions: { orderBy: { order: 'asc' } },
      },
    });

    return NextResponse.json(
      { data: quiz, message: 'Quiz created successfully' },
      { status: 201 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
