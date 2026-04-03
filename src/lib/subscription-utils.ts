import { db } from '@/lib/db';

export const GRACE_PERIOD_DAYS = 14;
export const LOCKOUT_YEARS_AFTER_EXPIRY = 1;
export const FREE_STUDENT_LIMIT = 30;
export const FREE_TEACHER_LIMIT = 3;

export const PLAN_LIMITS = {
  free: { students: 30, teachers: 3, classes: 10 },
  basic: { students: 100, teachers: 10, classes: 15 },
  pro: { students: 500, teachers: 50, classes: -1 },
  premium: { students: 2000, teachers: 200, classes: -1 },
  enterprise: { students: -1, teachers: -1, classes: -1 },
};

export const PREMIUM_FEATURES = [
  'video-lessons',
  'ai-grading',
  'homework-management',
  'parent-portal',
  'library-management',
  'transport-management',
  'custom-branding',
  'analytics-advanced',
  'multi-campus',
  'api-access',
  'white-label',
  'entrance-exams',
  'student-diary',
  'data-import-export',
  'id-card-generator',
  'bulk-operations',
];

export interface SubscriptionStatus {
  isActive: boolean;
  isExpired: boolean;
  isInGracePeriod: boolean;
  isFullyLocked: boolean;
  daysRemaining: number;
  graceDaysRemaining: number;
  canAddStudents: boolean;
  canAddTeachers: boolean;
  studentCapacity: number;
  teacherCapacity: number;
  allowedStudents: number;
  allowedTeachers: number;
  currentStudents: number;
  currentTeachers: number;
  planName: string;
  hasEverUpgraded: boolean;
}

export async function getSubscriptionStatus(schoolId: string): Promise<SubscriptionStatus> {
  const school = await db.school.findUnique({
    where: { id: schoolId },
    include: {
      subscriptionPlan: true,
      _count: {
        select: {
          students: { where: { deletedAt: null, isActive: true } },
          teachers: { where: { deletedAt: null, isActive: true } },
        },
      },
    },
  });

  if (!school) {
    return getDefaultStatus();
  }

  const now = new Date();
  const expiresAt = school.subscriptionExpiresAt;
  const graceEndsAt = school.gracePeriodEndsAt;
  const lockedAt = school.lockedAt;

  const isActive = expiresAt ? new Date(expiresAt) > now : true;
  const isExpired = expiresAt ? new Date(expiresAt) <= now : false;
  const isInGracePeriod = isExpired && graceEndsAt ? new Date(graceEndsAt) > now : false;
  const isFullyLocked = school.isFullyLocked || false;
  
  const graceDaysRemaining = isInGracePeriod && graceEndsAt
    ? Math.ceil((new Date(graceEndsAt).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    : 0;
  
  const daysRemaining = isActive && expiresAt
    ? Math.ceil((new Date(expiresAt).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  const planName = school.subscriptionPlan?.name || school.plan || 'free';
  const limits = PLAN_LIMITS[planName as keyof typeof PLAN_LIMITS] || PLAN_LIMITS.free;

  const isFreePlan = planName === 'free' || planName === 'basic';
  const hasUpgraded = school.hasEverUpgraded || false;

  let studentCapacity = limits.students;
  let teacherCapacity = limits.teachers;

  if (hasUpgraded && isExpired && !isInGracePeriod) {
    studentCapacity = FREE_STUDENT_LIMIT;
    teacherCapacity = FREE_TEACHER_LIMIT;
  } else if (!hasUpgraded) {
    studentCapacity = FREE_STUDENT_LIMIT;
    teacherCapacity = FREE_TEACHER_LIMIT;
  }

  const currentStudents = school._count.students;
  const currentTeachers = school._count.teachers;

  return {
    isActive,
    isExpired,
    isInGracePeriod,
    isFullyLocked,
    daysRemaining,
    graceDaysRemaining,
    canAddStudents: currentStudents < studentCapacity,
    canAddTeachers: currentTeachers < teacherCapacity,
    studentCapacity,
    teacherCapacity,
    allowedStudents: studentCapacity,
    allowedTeachers: teacherCapacity,
    currentStudents,
    currentTeachers,
    planName,
    hasEverUpgraded: hasUpgraded,
  };
}

function getDefaultStatus(): SubscriptionStatus {
  return {
    isActive: true,
    isExpired: false,
    isInGracePeriod: false,
    isFullyLocked: false,
    daysRemaining: -1,
    graceDaysRemaining: 0,
    canAddStudents: true,
    canAddTeachers: true,
    studentCapacity: FREE_STUDENT_LIMIT,
    teacherCapacity: FREE_TEACHER_LIMIT,
    allowedStudents: FREE_STUDENT_LIMIT,
    allowedTeachers: FREE_TEACHER_LIMIT,
    currentStudents: 0,
    currentTeachers: 0,
    planName: 'free',
    hasEverUpgraded: false,
  };
}

export function canAccessFeature(planName: string, feature: string): boolean {
  if (planName === 'free' || planName === 'basic') {
    return !PREMIUM_FEATURES.includes(feature);
  }
  
  const planTier: Record<string, number> = {
    free: 0,
    basic: 1,
    pro: 2,
    premium: 3,
    enterprise: 4,
  };
  
  const userTier = planTier[planName] || 0;
  
  const featureTiers: Record<string, number> = {
    'video-lessons': 2,
    'ai-grading': 2,
    'homework-management': 2,
    'parent-portal': 2,
    'library-management': 3,
    'transport-management': 3,
    'custom-branding': 3,
    'analytics-advanced': 3,
    'multi-campus': 4,
    'api-access': 4,
    'white-label': 4,
    'entrance-exams': 2,
    'student-diary': 2,
    'data-import-export': 3,
    'id-card-generator': 2,
    'bulk-operations': 2,
  };
  
  const requiredTier = featureTiers[feature] || 2;
  return userTier >= requiredTier;
}

export async function updateSchoolOnUpgrade(schoolId: string, newPlanId: string) {
  const now = new Date();
  const oneYearFromNow = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
  
  await db.school.update({
    where: { id: schoolId },
    data: {
      planId: newPlanId,
      hasEverUpgraded: true,
      subscriptionExpiresAt: oneYearFromNow,
      gracePeriodEndsAt: null,
      isFullyLocked: false,
      lockedAt: null,
      lastActiveAt: now,
    },
  });
}

export async function processExpiredSubscription(schoolId: string) {
  const school = await db.school.findUnique({
    where: { id: schoolId },
  });

  if (!school) return;

  const now = new Date();
  const graceEnds = new Date(now.getFullYear(), now.getMonth(), now.getDate() + GRACE_PERIOD_DAYS);

  if (school.hasEverUpgraded) {
    const lockDate = new Date(now.getFullYear() + LOCKOUT_YEARS_AFTER_EXPIRY, now.getMonth(), now.getDate());
    
    await db.school.update({
      where: { id: schoolId },
      data: {
        gracePeriodEndsAt: graceEnds,
        isFullyLocked: false,
      },
    });

    const oneYearLater = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
    if (oneYearLater >= lockDate) {
      await db.school.update({
        where: { id: schoolId },
        data: {
          isFullyLocked: true,
          lockedAt: now,
        },
      });
    }
  } else {
    await db.school.update({
      where: { id: schoolId },
      data: {
        subscriptionExpiresAt: null,
        gracePeriodEndsAt: null,
        isFullyLocked: false,
        lockedAt: null,
      },
    });
  }
}

export async function checkAndUpdateUserLoginAccess(userId: string, schoolId: string): Promise<{
  canLogin: boolean;
  reason?: string;
  isAdminOnly?: boolean;
}> {
  const status = await getSubscriptionStatus(schoolId);
  
  if (status.isActive || status.isInGracePeriod) {
    return { canLogin: true };
  }

  if (!status.hasEverUpgraded) {
    return { canLogin: true };
  }

  const user = await db.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    return { canLogin: false, reason: 'User not found' };
  }

  if (user.role === 'SCHOOL_ADMIN' || user.role === 'SUPER_ADMIN' || user.role === 'DIRECTOR') {
    return { canLogin: true, isAdminOnly: status.isFullyLocked };
  }

  if (status.isFullyLocked) {
    return { 
      canLogin: false, 
      reason: 'Your school\'s subscription has expired. Please contact your school admin to renew.' 
    };
  }

  if (user.role === 'STUDENT') {
    if (user.studentLoginOrder && user.studentLoginOrder <= FREE_STUDENT_LIMIT) {
      return { canLogin: true };
    }

    const currentOrder = await getNextStudentLoginOrder(schoolId);
    if (currentOrder <= FREE_STUDENT_LIMIT) {
      await db.user.update({
        where: { id: userId },
        data: { 
          studentLoginOrder: currentOrder,
          isPostExpiryLogin: true,
        },
      });
      return { canLogin: true };
    }

    return {
      canLogin: false,
      reason: `Your school has reached the ${FREE_STUDENT_LIMIT} student limit. Please contact your school admin to upgrade.`,
    };
  }

  if (user.role === 'TEACHER') {
    if (user.teacherLoginOrder && user.teacherLoginOrder <= FREE_TEACHER_LIMIT) {
      return { canLogin: true };
    }

    const currentOrder = await getNextTeacherLoginOrder(schoolId);
    if (currentOrder <= FREE_TEACHER_LIMIT) {
      await db.user.update({
        where: { id: userId },
        data: { 
          teacherLoginOrder: currentOrder,
          isPostExpiryLogin: true,
        },
      });
      return { canLogin: true };
    }

    return {
      canLogin: false,
      reason: `Your school has reached the ${FREE_TEACHER_LIMIT} teacher limit. Please contact your school admin to upgrade.`,
    };
  }

  return {
    canLogin: false,
    reason: 'Your school\'s subscription has expired. Please contact your school admin.',
  };
}

async function getNextStudentLoginOrder(schoolId: string): Promise<number> {
  const lastStudent = await db.user.findFirst({
    where: { 
      schoolId,
      role: 'STUDENT',
      studentLoginOrder: { not: null },
    },
    orderBy: { studentLoginOrder: 'desc' },
  });
  return (lastStudent?.studentLoginOrder || 0) + 1;
}

async function getNextTeacherLoginOrder(schoolId: string): Promise<number> {
  const lastTeacher = await db.user.findFirst({
    where: { 
      schoolId,
      role: 'TEACHER',
      teacherLoginOrder: { not: null },
    },
    orderBy: { teacherLoginOrder: 'desc' },
  });
  return (lastTeacher?.teacherLoginOrder || 0) + 1;
}

export async function updateSchoolLastActive(schoolId: string) {
  await db.school.update({
    where: { id: schoolId },
    data: { lastActiveAt: new Date() },
  });
}

export async function unlockSchool(schoolId: string, durationMonths: number = 1) {
  const now = new Date();
  const endDate = new Date(now.getFullYear(), now.getMonth() + durationMonths, now.getDate());
  const graceEnds = new Date(now.getFullYear(), now.getMonth(), now.getDate() + GRACE_PERIOD_DAYS);

  await db.school.update({
    where: { id: schoolId },
    data: {
      subscriptionExpiresAt: endDate,
      gracePeriodEndsAt: graceEnds,
      isFullyLocked: false,
      lockedAt: null,
    },
  });
}