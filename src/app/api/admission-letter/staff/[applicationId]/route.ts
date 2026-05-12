import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-middleware';
import { generateStaffOfferLetter } from '@/lib/admission-letter';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ applicationId: string }> }
) {
  try {
    const auth = await requireAuth(request);
    if (auth instanceof NextResponse) return auth;

    const { applicationId } = await params;
    const { searchParams } = new URL(request.url);
    const customPrimary = searchParams.get('primaryColor');
    const customSecondary = searchParams.get('secondaryColor');
    const showSalary = searchParams.get('showSalary') === 'true';

    const application = await db.jobApplication.findUnique({
      where: { id: applicationId },
      include: {
        jobPosting: {
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

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    if (application.status !== 'hired') {
      return NextResponse.json({ error: 'Applicant has not been hired yet' }, { status: 400 });
    }

    const school = application.jobPosting.school;
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

    const applicantInfo = {
      applicantName: application.applicantName,
      applicantEmail: application.applicantEmail,
      applicantPhone: application.applicantPhone,
      jobTitle: application.jobPosting.title,
      department: application.jobPosting.department,
      hiredAt: application.hiredAt,
      offeredSalary: application.offeredSalary,
    };

    const customTheme = customPrimary || customSecondary
      ? { primaryColor: customPrimary || undefined, secondaryColor: customSecondary || undefined }
      : undefined;

    const html = generateStaffOfferLetter(schoolInfo, settingsInfo, applicantInfo, showSalary, customTheme);

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
