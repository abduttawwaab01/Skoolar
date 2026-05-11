import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-middleware';
import QRCode from 'qrcode';

// GET /api/school/qr - Generate school attendance QR code
export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (auth instanceof NextResponse) return auth;

    const { searchParams } = new URL(request.url);
    const schoolId = searchParams.get('schoolId') || auth.schoolId;

    if (!schoolId) {
      return NextResponse.json({ error: 'School ID is required' }, { status: 400 });
    }

    // Verify user belongs to school or is super admin
    if (auth.role !== 'SUPER_ADMIN' && auth.schoolId !== schoolId) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const school = await db.school.findUnique({
      where: { id: schoolId },
      select: { name: true, slug: true }
    });

    if (!school) {
      return NextResponse.json({ error: 'School not found' }, { status: 404 });
    }

    // Data to be encoded in the QR code
    const qrData = {
      type: 'school_attendance',
      schoolId: schoolId,
      schoolName: school.name,
      timestamp: Date.now(),
      // In a production environment, you would sign this data or add a rotating daily secret
    };

    const qrString = JSON.stringify(qrData);
    
    // Generate QR code as Data URL
    const dataUrl = await QRCode.toDataURL(qrString, {
      width: 1024, // High resolution for printing
      margin: 2,
      color: {
        dark: '#059669', // Emerald 600
        light: '#FFFFFF',
      },
    });

    // Convert Data URL to Buffer to serve as image
    const base64Data = dataUrl.replace(/^data:image\/png;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'image/png',
        'Content-Disposition': `attachment; filename="school-qr-${school.slug}.png"`,
      },
    });
  } catch (error: unknown) {
    console.error('School QR API Error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
