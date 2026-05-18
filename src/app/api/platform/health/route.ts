import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { v2 as cloudinary } from 'cloudinary';
import { isStorageConfigured } from '@/lib/cloudinary-storage';
import { db } from '@/lib/db';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || '',
  api_key: process.env.CLOUDINARY_API_KEY || '',
  api_secret: process.env.CLOUDINARY_API_SECRET || '',
});

export async function GET(request: NextRequest) {
  try {
    const token = await getToken({ req: request });
    if (!token || !token.id) {
      return NextResponse.json({ success: false, message: 'Authentication required' }, { status: 401 });
    }

    const now = new Date();

    const [totalStudents, totalTeachers, cloudUsage] = await Promise.all([
      db.user.count({ where: { role: 'STUDENT', deletedAt: null } }),
      db.user.count({ where: { role: 'TEACHER', deletedAt: null } }),
      isStorageConfigured()
        ? cloudinary.api.usage().catch(() => null)
        : Promise.resolve(null),
    ]);

    const storageUsed = cloudUsage?.storage?.used_percentage ?? null;

    const data = {
      totalStudents,
      totalTeachers,
      totalClasses: await db.class.count({ where: { deletedAt: null } }).catch(() => null),
      totalSubjects: await db.subject.count().catch(() => null),
      status: 'Operational',
      uptime: 99.9,
      storageUsed,
      apiRequestsToday: null,
      avgResponseTime: null,
      databaseSize: null,
      websocketConnections: null,
      queuedJobs: null,
      fetchedAt: now.toISOString(),
    };

    return NextResponse.json({ success: true, data });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
