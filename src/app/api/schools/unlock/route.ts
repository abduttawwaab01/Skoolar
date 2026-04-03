import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth-middleware';

// POST - Super Admin unlocks a school (removes all restrictions)
export async function POST(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  if (authResult.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Access denied. Super Admin only.' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { schoolId, durationMonths } = body;

    if (!schoolId) {
      return NextResponse.json({ error: 'schoolId is required' }, { status: 400 });
    }

    const school = await db.school.findUnique({
      where: { id: schoolId },
      include: { subscriptionPlan: true },
    });

    if (!school) {
      return NextResponse.json({ error: 'School not found' }, { status: 404 });
    }

    const duration = durationMonths || 1;
    const now = new Date();
    const endDate = new Date(now.getFullYear(), now.getMonth() + duration, now.getDate());
    const graceEnds = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 14);

    await db.school.update({
      where: { id: schoolId },
      data: {
        subscriptionExpiresAt: endDate,
        gracePeriodEndsAt: graceEnds,
        isFullyLocked: false,
        lockedAt: null,
        hasEverUpgraded: true,
        lastActiveAt: now,
      },
    });

    return NextResponse.json({
      message: `School "${school.name}" has been unlocked. Subscription extended by ${duration} month(s) until ${endDate.toLocaleDateString()}.`,
      success: true,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// GET - Get all schools with expiry information
export async function GET(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  if (authResult.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Access denied. Super Admin only.' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // 'active', 'expired', 'grace', 'locked'

    const schools = await db.school.findMany({
      include: {
        subscriptionPlan: true,
        _count: {
          select: {
            students: { where: { deletedAt: null, isActive: true } },
            teachers: { where: { deletedAt: null, isActive: true } },
            users: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const now = new Date();
    const filteredSchools = schools.filter(school => {
      const expiresAt = school.subscriptionExpiresAt;
      const isExpired = expiresAt ? new Date(expiresAt) <= now : false;
      const isInGrace = school.gracePeriodEndsAt ? new Date(school.gracePeriodEndsAt) > now : false;
      const isLocked = school.isFullyLocked;

      if (status === 'active') return !isExpired;
      if (status === 'expired') return isExpired && !isInGrace && !isLocked;
      if (status === 'grace') return isExpired && isInGrace;
      if (status === 'locked') return isLocked;
      return true;
    });

    const schoolsWithStatus = filteredSchools.map(school => {
      const expiresAt = school.subscriptionExpiresAt;
      const isExpired = expiresAt ? new Date(expiresAt) <= now : false;
      const isInGrace = school.gracePeriodEndsAt ? new Date(school.gracePeriodEndsAt) > now : false;
      const daysRemaining = isExpired && isInGrace && school.gracePeriodEndsAt
        ? Math.ceil((new Date(school.gracePeriodEndsAt).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        : isExpired
          ? 0
          : expiresAt
            ? Math.ceil((new Date(expiresAt).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
            : -1;

      return {
        ...school,
        isExpired,
        isInGrace,
        isLocked: school.isFullyLocked,
        daysRemaining: Math.floor(daysRemaining),
        lockedAt: school.lockedAt,
      };
    });

    return NextResponse.json({ data: schoolsWithStatus });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}