import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-middleware';
import { generateStudentAdmissionLetter } from '@/lib/admission-letter';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ attemptId: string }> }
) {
  try {
    const auth = await requireAuth(request);
    if (auth instanceof NextResponse) return auth;

    const { attemptId } = await params;
    const { searchParams } = new URL(request.url);
    const customPrimary = searchParams.get('primaryColor');
    const customSecondary = searchParams.get('secondaryColor');

    const attempt = await db.entranceExamAttempt.findUnique({
      where: { id: attemptId },
      include: {
        exam: {
          include: {
            school: {
              include: {
                settings: true,
              },
            },
          },
        },
      },
    });

    if (!attempt) {
      return NextResponse.json({ error: 'Attempt not found' }, { status: 404 });
    }

    if (attempt.registrationStatus !== 'admitted') {
      return NextResponse.json({ error: 'Candidate has not been admitted yet' }, { status: 400 });
    }

    const school = attempt.exam.school;
    const settings = school.settings;

    const schoolInfo = {
      name: school.name,
      logo: school.logo,
      motto: school.motto,
      address: school.address,
      phone: school.phone,
      email: school.email,
      primaryColor: school.primaryColor,
      secondaryColor: school.secondaryColor,
    };

    const settingsInfo = {
      principalName: settings?.principalName || null,
      academicSession: settings?.academicSession || null,
      nextTermBegins: settings?.nextTermBegins || null,
    };

    const candidateInfo = {
      applicantName: attempt.applicantName,
      applicantEmail: attempt.applicantEmail,
      applicantPhone: attempt.applicantPhone,
      appliedClass: attempt.appliedClass,
      finalScore: attempt.finalScore,
      admittedAt: attempt.admittedAt,
    };

    const customTheme = customPrimary || customSecondary
      ? { primaryColor: customPrimary || undefined, secondaryColor: customSecondary || undefined }
      : undefined;

    const html = generateStudentAdmissionLetter(schoolInfo, settingsInfo, candidateInfo, customTheme);

    // Mark admission offer as sent
    if (!attempt.admissionOfferSentAt) {
      await db.entranceExamAttempt.update({
        where: { id: attemptId },
        data: { admissionOfferSentAt: new Date() },
      });
    }

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
