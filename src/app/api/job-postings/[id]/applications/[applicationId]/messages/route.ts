import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-middleware';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; applicationId: string }> }
) {
  try {
    const auth = await requireAuth(request);
    if (auth instanceof NextResponse) return auth;

    const { id: jobPostingId, applicationId } = await params;

    const jobPosting = await db.jobPosting.findUnique({ where: { id: jobPostingId, deletedAt: null } });
    if (!jobPosting) return NextResponse.json({ error: 'Job posting not found' }, { status: 404 });
    if (auth.role !== 'SUPER_ADMIN' && jobPosting.schoolId !== auth.schoolId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const application = await db.jobApplication.findFirst({
      where: { id: applicationId, jobPostingId },
    });
    if (!application) return NextResponse.json({ error: 'Application not found' }, { status: 404 });

    const messages = await db.interviewMessage.findMany({
      where: { applicationId },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json({ data: messages });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; applicationId: string }> }
) {
  try {
    const auth = await requireAuth(request);
    if (auth instanceof NextResponse) return auth;

    const { id: jobPostingId, applicationId } = await params;
    const body = await request.json();
    const { content } = body;

    if (!content || typeof content !== 'string' || !content.trim()) {
      return NextResponse.json({ error: 'Message content is required' }, { status: 400 });
    }

    const jobPosting = await db.jobPosting.findUnique({ where: { id: jobPostingId, deletedAt: null } });
    if (!jobPosting) return NextResponse.json({ error: 'Job posting not found' }, { status: 404 });
    if (auth.role !== 'SUPER_ADMIN' && jobPosting.schoolId !== auth.schoolId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const application = await db.jobApplication.findFirst({
      where: { id: applicationId, jobPostingId },
    });
    if (!application) return NextResponse.json({ error: 'Application not found' }, { status: 404 });

    const user = await db.user.findUnique({
      where: { id: auth.userId },
      select: { name: true },
    });

    const message = await db.interviewMessage.create({
      data: {
        applicationId,
        senderId: auth.userId,
        senderName: user?.name || 'School Admin',
        content: content.trim(),
        isFromAdmin: true,
      },
    });

    return NextResponse.json({ data: message, message: 'Message sent' }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
