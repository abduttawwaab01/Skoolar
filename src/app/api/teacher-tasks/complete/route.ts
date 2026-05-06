import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { db } from '@/lib/db';
import { requireAuthAndRole, errorResponse, successResponse } from '@/lib/api-helpers';

// POST /api/teacher-tasks/complete - Teacher submits task completion
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuthAndRole(request, ['TEACHER', 'SCHOOL_ADMIN', 'SUPER_ADMIN']);
    if (!authResult.valid) return authResult.error;
    const { auth } = authResult;

    const body = await request.json();
    const { taskId, notes, attachmentUrl } = body;

    if (!taskId) {
      return errorResponse('taskId is required', 400);
    }

    let teacherId: string;

    // If admin verifying, they need to specify teacher
    if (auth.role === 'SCHOOL_ADMIN' || auth.role === 'SUPER_ADMIN') {
      if (!body.teacherId) {
        return errorResponse('teacherId is required for admin', 400);
      }
      teacherId = body.teacherId;
    } else {
      // Get teacher's ID
      const teacher = await db.teacher.findUnique({
        where: { userId: auth.userId },
        select: { id: true },
      });

      if (!teacher) {
        return errorResponse('Teacher profile not found', 404);
      }
      teacherId = teacher.id;
    }

    // Check if task exists and belongs to this teacher
    const task = await db.teacherTask.findFirst({
      where: { id: taskId, teacherId },
    });

    if (!task) {
      return errorResponse('Task not found or does not belong to this teacher', 404);
    }

    // Check if completion already exists
    const existingCompletion = await db.teacherTaskCompletion.findUnique({
      where: {
        taskId_teacherId: {
          taskId,
          teacherId,
        },
      },
    });

    let completion;
    if (existingCompletion) {
      // Update existing completion
      completion = await db.teacherTaskCompletion.update({
        where: { id: existingCompletion.id },
        data: {
          notes,
          attachmentUrl,
          completedAt: new Date(),
        },
      });
    } else {
      // Create new completion
      completion = await db.teacherTaskCompletion.create({
        data: {
          taskId,
          teacherId,
          notes,
          attachmentUrl,
          completedAt: new Date(),
          status: 'pending',
        },
      });

      // Update task status to in_progress or completed
      await db.teacherTask.update({
        where: { id: taskId },
        data: { status: 'in_progress' },
      });
    }

    return successResponse(completion, 'Task completion submitted');
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return errorResponse(message, 500);
  }
}

// PUT /api/teacher-tasks/complete - Admin verifies task completion
export async function PUT(request: NextRequest) {
  try {
    const authResult = await requireAuthAndRole(request, ['SCHOOL_ADMIN', 'SUPER_ADMIN', 'DIRECTOR']);
    if (!authResult.valid) return authResult.error;

    const body = await request.json();
    const { completionId, status, feedback } = body;

    if (!completionId || !status) {
      return errorResponse('completionId and status are required', 400);
    }

    if (!['approved', 'rejected'].includes(status)) {
      return errorResponse('Invalid status. Must be "approved" or "rejected"', 400);
    }

    // Get the completion
    const completion = await db.teacherTaskCompletion.findUnique({
      where: { id: completionId },
      include: { task: true },
    });

    if (!completion) {
      return errorResponse('Completion not found', 404);
    }

    // Verify school access
    if (authResult.auth.role !== 'SUPER_ADMIN' && completion.task.schoolId !== authResult.auth.schoolId) {
      return errorResponse('Unauthorized', 403);
    }

    // Update completion
    const updated = await db.teacherTaskCompletion.update({
      where: { id: completionId },
      data: {
        status,
        feedback,
        verifiedBy: authResult.auth.userId,
        verifiedAt: new Date(),
      },
    });

    // Update task status if approved
    if (status === 'approved') {
      await db.teacherTask.update({
        where: { id: completion.taskId },
        data: { status: 'completed' },
      });
    }

    return successResponse(updated, `Task ${status}`);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return errorResponse(message, 500);
  }
}

// GET /api/teacher-tasks/complete - Get completion details
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuthAndRole(request, ['TEACHER', 'SCHOOL_ADMIN', 'SUPER_ADMIN', 'DIRECTOR']);
    if (!authResult.valid) return authResult.error;

    const { searchParams } = new URL(request.url);
    const completionId = searchParams.get('completionId');
    const taskId = searchParams.get('taskId');

    if (!completionId && !taskId) {
      return errorResponse('completionId or taskId is required', 400);
    }

    const where = completionId 
      ? { id: completionId }
      : taskId ? { taskId } : {};

    const completion = await db.teacherTaskCompletion.findFirst({
      where,
      include: {
        task: {
          include: {
            teacher: {
              include: { user: { select: { name: true, avatar: true } } },
            },
            attachments: true,
          },
        },
      },
    });

    if (!completion) {
      return errorResponse('Completion not found', 404);
    }

    return successResponse({
      ...completion,
      task: {
        ...completion.task,
        attachments: completion.task.attachments,
        teacher: completion.task.teacher,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return errorResponse(message, 500);
  }
}