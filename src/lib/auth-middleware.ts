import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { checkAndUpdateUserLoginAccess, getSubscriptionStatus, updateSchoolLastActive, type SubscriptionStatus } from './subscription-utils';

const JWT_SECRET = process.env.NEXTAUTH_SECRET;

export interface AuthResult {
  authenticated: boolean;
  userId?: string;
  role?: string;
  schoolId?: string;
  schoolName?: string;
  subscriptionStatus?: SubscriptionStatus;
  canAccessFullDashboard?: boolean;
  loginBlockedReason?: string;
}

/**
 * Check authentication from request headers.
 * Returns user info if authenticated, null otherwise.
 */
export async function authenticateRequest(request: NextRequest): Promise<AuthResult> {
  try {
    const token = await getToken({ req: request, secret: JWT_SECRET });
    if (!token) return { authenticated: false };

    const authResult: AuthResult = {
      authenticated: true,
      userId: token.id as string,
      role: token.role as string,
      schoolId: token.schoolId as string | undefined,
      schoolName: token.schoolName as string | undefined,
    };

    if (authResult.schoolId) {
      const subStatus = await getSubscriptionStatus(authResult.schoolId);
      authResult.subscriptionStatus = subStatus;
      
      const accessCheck = await checkAndUpdateUserLoginAccess(authResult.userId!, authResult.schoolId);
      authResult.canAccessFullDashboard = accessCheck.canLogin;
      authResult.loginBlockedReason = accessCheck.reason;
      
      await updateSchoolLastActive(authResult.schoolId);
    }

    return authResult;
  } catch {
    return { authenticated: false };
  }
}

/**
 * Require authentication — returns 401 if not authenticated.
 * Also checks subscription status and blocks access if expired.
 */
export async function requireAuth(request: NextRequest): Promise<AuthResult & { authenticated: true } | NextResponse> {
  const auth = await authenticateRequest(request);
  if (!auth.authenticated) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  if (auth.schoolId && auth.subscriptionStatus) {
    const { canAccessFullDashboard, loginBlockedReason, subscriptionStatus } = auth;
    const isAdmin = auth.role === 'SCHOOL_ADMIN' || auth.role === 'SUPER_ADMIN' || auth.role === 'DIRECTOR';

    if (!canAccessFullDashboard && !isAdmin) {
      return NextResponse.json(
        { 
          error: loginBlockedReason || 'Access denied',
          code: 'SUBSCRIPTION_EXPIRED',
          subscriptionStatus 
        },
        { status: 403 }
      );
    }

    if (!canAccessFullDashboard && isAdmin && subscriptionStatus.isFullyLocked) {
      return NextResponse.json(
        { 
          error: 'Your subscription has expired. Please upgrade to continue using the platform.',
          code: 'SUBSCRIPTION_FULLY_LOCKED',
          subscriptionStatus 
        },
        { status: 403 }
      );
    }
  }

  return auth as AuthResult & { authenticated: true };
}

/**
 * Require a specific role — returns 403 if wrong role.
 */
export async function requireRole(request: NextRequest, roles: string | string[]): Promise<AuthResult & { authenticated: true } | NextResponse> {
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  const allowedRoles = Array.isArray(roles) ? roles : [roles];
  if (!authResult.role || !allowedRoles.includes(authResult.role)) {
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
  }

  return authResult;
}

/**
 * Extract school ID from request — from query params, body, or auth token.
 */
export function getSchoolId(request: NextRequest, auth?: AuthResult): string | null {
  // Try from URL search params
  const { searchParams } = new URL(request.url);
  const urlSchoolId = searchParams.get('schoolId');
  if (urlSchoolId) return urlSchoolId;

  // Try from auth token
  if (auth?.schoolId) return auth.schoolId;

  return null;
}
