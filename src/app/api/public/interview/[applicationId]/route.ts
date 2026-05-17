import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ applicationId: string }> }
) {
  try {
    const { applicationId } = await params;
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ error: 'Email is required to view messages' }, { status: 400 });
    }

    const application = await db.jobApplication.findUnique({
      where: { id: applicationId },
      include: {
        jobPosting: {
          include: {
            school: { select: { id: true, name: true, logo: true, primaryColor: true } },
          },
        },
      },
    });

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    if (application.applicantEmail.toLowerCase() !== email.toLowerCase()) {
      return NextResponse.json({ error: 'Email does not match this application' }, { status: 403 });
    }

    const messages = await db.interviewMessage.findMany({
      where: { applicationId },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json({
      data: {
        messages,
        application: {
          id: application.id,
          status: application.status,
          applicantName: application.applicantName,
          jobTitle: application.jobPosting.title,
          school: application.jobPosting.school,
        },
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ applicationId: string }> }
) {
  try {
    const { applicationId } = await params;
    const body = await request.json();
    const { email, content } = body;

    if (!email || !content || typeof content !== 'string' || !content.trim()) {
      return NextResponse.json({ error: 'Email and message content are required' }, { status: 400 });
    }

    const application = await db.jobApplication.findUnique({
      where: { id: applicationId },
    });

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    if (application.applicantEmail.toLowerCase() !== email.toLowerCase()) {
      return NextResponse.json({ error: 'Email does not match this application' }, { status: 403 });
    }

    const message = await db.interviewMessage.create({
      data: {
        applicationId,
        senderName: application.applicantName,
        content: content.trim(),
        isFromAdmin: false,
      },
    });

    return NextResponse.json({ data: message, message: 'Message sent' }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
