'use client';

import React from 'react';
import { useAppStore } from '@/store/app-store';
import { canAccessFeature, type SubscriptionStatus } from '@/lib/subscription-utils';
import { Lock, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Link from 'next/link';

interface PremiumOnlyProps {
  feature: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function PremiumOnly({ feature, children, fallback }: PremiumOnlyProps) {
  const { currentUser, currentRole } = useAppStore();
  const [subscriptionStatus, setSubscriptionStatus] = React.useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!currentUser.schoolId) {
      setLoading(false);
      return;
    }

    fetch(`/api/schools/subscription-status?schoolId=${currentUser.schoolId}`)
      .then(res => res.json())
      .then(data => {
        if (data.status) {
          setSubscriptionStatus(data.status);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [currentUser.schoolId]);

  if (loading) {
    return <>{children}</>;
  }

  if (!subscriptionStatus) {
    return <>{children}</>;
  }

  const planName = subscriptionStatus.planName;
  const hasAccess = canAccessFeature(planName, feature);

  if (hasAccess) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  const isAdmin = currentRole === 'SCHOOL_ADMIN' || currentRole === 'SUPER_ADMIN' || currentRole === 'DIRECTOR';

  return (
    <Card className="border-amber-200 bg-amber-50">
      <CardContent className="py-8 text-center">
        <div className="flex justify-center mb-4">
          <div className="flex size-16 items-center justify-center rounded-full bg-amber-100">
            <Lock className="size-8 text-amber-600" />
          </div>
        </div>
        <h3 className="text-lg font-semibold text-amber-900 mb-2">Premium Feature</h3>
        <p className="text-sm text-amber-700 mb-4">
          This feature is available on higher plans. Upgrade to unlock it.
        </p>
        {isAdmin && (
          <Link href="/dashboard?view=subscription">
            <Button className="bg-amber-600 hover:bg-amber-700">
              Upgrade Now
            </Button>
          </Link>
        )}
        {!isAdmin && (
          <p className="text-xs text-amber-600">
            Contact your school admin to upgrade.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export function SubscriptionBanner() {
  const { currentUser, currentRole } = useAppStore();
  const [subscriptionStatus, setSubscriptionStatus] = React.useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!currentUser.schoolId) {
      setLoading(false);
      return;
    }

    fetch(`/api/schools/subscription-status?schoolId=${currentUser.schoolId}`)
      .then(res => res.json())
      .then(data => {
        if (data.status) {
          setSubscriptionStatus(data.status);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [currentUser.schoolId]);

  if (loading || !subscriptionStatus) {
    return null;
  }

  const { isExpired, isInGracePeriod, isFullyLocked, daysRemaining, graceDaysRemaining, planName, hasEverUpgraded } = subscriptionStatus;
  const isAdmin = currentRole === 'SCHOOL_ADMIN' || currentRole === 'SUPER_ADMIN' || currentRole === 'DIRECTOR';

  if (!isExpired && !isInGracePeriod) {
    return null;
  }

  if (isFullyLocked && !isAdmin) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      <Alert variant={isFullyLocked ? 'destructive' : 'default'} className={isFullyLocked ? 'rounded-none' : 'rounded-none border-amber-200 bg-amber-50'}>
        {isFullyLocked ? <Lock className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
        <AlertTitle>
          {isFullyLocked 
            ? 'Subscription Expired - Access Limited' 
            : isInGracePeriod 
              ? 'Subscription Expiring Soon' 
              : 'Subscription Expired'}
        </AlertTitle>
        <AlertDescription className="flex items-center justify-between">
          <span>
            {isFullyLocked
              ? `Your ${planName} plan has expired. Only admins can access the dashboard. Please upgrade to restore full access.`
              : isInGracePeriod
                ? `Your subscription expires in ${graceDaysRemaining} days. Upgrade now to avoid interruption.`
                : `Your ${planName} plan has expired. ${hasEverUpgraded ? 'Only first 30 students and 3 teachers can login.' : 'Free plan limits now apply.'}`}
          </span>
          {isAdmin && (
            <Link href="/dashboard?view=subscription">
              <Button size="sm" variant={isFullyLocked ? 'destructive' : 'default'} className="ml-4">
                {isFullyLocked ? 'Upgrade Now' : 'Renew'}
              </Button>
            </Link>
          )}
        </AlertDescription>
      </Alert>
    </div>
  );
}

export function useFeatureAccess(feature: string): boolean {
  const { currentUser } = useAppStore();
  const [hasAccess, setHasAccess] = React.useState(true);

  React.useEffect(() => {
    if (!currentUser.schoolId) {
      setHasAccess(true);
      return;
    }

    fetch(`/api/schools/subscription-status?schoolId=${currentUser.schoolId}`)
      .then(res => res.json())
      .then(data => {
        if (data.status) {
          setHasAccess(canAccessFeature(data.status.planName, feature));
        }
      })
      .catch(() => setHasAccess(true));
  }, [currentUser.schoolId, feature]);

  return hasAccess;
}