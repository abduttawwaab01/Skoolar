import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { db } from '@/lib/db';
import { seedDatabase, seedSubscriptionPlans, hashPassword } from '@/lib/seed';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const forceReset = body?.forceReset === true;
    
    // Check if SUPER_ADMIN already exists - allow first-time seeding without auth
    let existingAdmin = await db.user.findFirst({
      where: { role: 'SUPER_ADMIN' },
    });

    // If admin exists, verify SUPER_ADMIN authentication unless forceReset is true
    if (existingAdmin && !forceReset) {
      const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
      if (!token || token.role !== 'SUPER_ADMIN') {
        return NextResponse.json({ error: 'Unauthorized. Super Admin access required.' }, { status: 401 });
      }
    }

    // Always seed subscription plans (idempotent - only creates if missing)
    const plans = await seedSubscriptionPlans();

    if (existingAdmin && !forceReset) {
      return NextResponse.json(
        {
          message: 'Super Admin already exists. Subscription plans seeded/verified.',
          email: existingAdmin.email,
          plansSeeded: plans.length,
        },
        { status: 200 }
      );
    }

    // If forceReset is true, update the existing admin password
    if (existingAdmin && forceReset) {
      const newHash = await hashPassword('successor');
      existingAdmin = await db.user.update({
        where: { id: existingAdmin.id },
        data: { password: newHash, isActive: true },
      });
      return NextResponse.json(
        {
          message: 'Super Admin password reset successfully.',
          email: existingAdmin.email,
          password: 'successor',
          plansSeeded: plans.length,
        },
        { status: 200 }
      );
    }

    const result = await seedDatabase();

    return NextResponse.json({ ...result, plansSeeded: plans.length }, { status: 201 });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json(
      { error: 'Failed to seed database.', details: String(error) },
      { status: 500 }
    );
  }
}
