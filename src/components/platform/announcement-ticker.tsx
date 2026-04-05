'use client';

import { useEffect, useState } from 'react';
import { X, Info, AlertTriangle, AlertCircle, CheckCircle2, Megaphone } from 'lucide-react';
import { handleSilentError } from '@/lib/error-handler';
import { useAppStore } from '@/store/app-store';

interface PlatformAnnouncement {
  id: string;
  title: string | null;
  message: string;
  type: string;
  targetRoles: string | null;
  targetSchools: string | null;
  linkUrl?: string;
  isActive: boolean;
  startsAt: string;
  expiresAt: string | null;
}

const typeConfig: Record<string, { bg: string; iconBg: string; icon: typeof Info; textColor: string; borderColor: string }> = {
  info: {
    bg: 'bg-blue-50',
    iconBg: 'bg-blue-500',
    icon: Info,
    textColor: 'text-blue-800',
    borderColor: 'border-blue-200',
  },
  warning: {
    bg: 'bg-amber-50',
    iconBg: 'bg-amber-500',
    icon: AlertTriangle,
    textColor: 'text-amber-800',
    borderColor: 'border-amber-200',
  },
  urgent: {
    bg: 'bg-red-50',
    iconBg: 'bg-red-500',
    icon: AlertCircle,
    textColor: 'text-red-800',
    borderColor: 'border-red-200',
  },
  success: {
    bg: 'bg-emerald-50',
    iconBg: 'bg-emerald-500',
    icon: CheckCircle2,
    textColor: 'text-emerald-800',
    borderColor: 'border-emerald-200',
  },
};

function parseJsonArray(value: string | null): string[] {
  if (!value) return [];
  try {
    return JSON.parse(value);
  } catch {
    return [];
  }
}

function shouldShowAnnouncement(announcement: PlatformAnnouncement, userRole: string, userSchoolId: string): boolean {
  const now = new Date();
  const startsAt = announcement.startsAt ? new Date(announcement.startsAt) : null;
  const expiresAt = announcement.expiresAt ? new Date(announcement.expiresAt) : null;

  // Check if announcement is active and within date range
  if (!announcement.isActive) return false;
  if (startsAt && startsAt > now) return false;
  if (expiresAt && expiresAt < now) return false;

  // Check school filtering - if targetSchools is set, user must be in one of those schools
  const targetSchools = parseJsonArray(announcement.targetSchools);
  if (targetSchools.length > 0 && userSchoolId) {
    if (!targetSchools.includes(userSchoolId)) return false;
  }

  // Check role filtering - if targetRoles is set, user role must match one of those roles
  const targetRoles = parseJsonArray(announcement.targetRoles);
  if (targetRoles.length > 0 && userRole) {
    // Map store roles to announcement target roles
    const roleMapping: Record<string, string> = {
      'SUPER_ADMIN': 'SUPER_ADMIN',
      'SCHOOL_ADMIN': 'SCHOOL_ADMIN',
      'TEACHER': 'TEACHER',
      'STUDENT': 'STUDENT',
      'PARENT': 'PARENT',
      'ACCOUNTANT': 'ACCOUNTANT',
      'LIBRARIAN': 'LIBRARIAN',
      'DIRECTOR': 'DIRECTOR',
    };
    
    const mappedRole = roleMapping[userRole];
    if (!mappedRole || !targetRoles.includes(mappedRole)) return false;
  }

  return true;
}

export function AnnouncementTicker() {
  const [announcements, setAnnouncements] = useState<PlatformAnnouncement[]>([]);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [isPaused, setIsPaused] = useState(false);
  const [offset, setOffset] = useState(0);
  const { currentRole, currentUser } = useAppStore();

  useEffect(() => {
    let cancelled = false;
    const fetchAnnouncements = async () => {
      try {
        const res = await fetch('/api/platform/announcements');
        const json = await res.json();
        if (!cancelled && json.success) {
          setAnnouncements(json.data);
        }
      } catch (error: unknown) {
        handleSilentError(error, 'Failed to fetch announcements');
      }
    };
    fetchAnnouncements();
    const interval = setInterval(fetchAnnouncements, 60000);
    return () => { cancelled = true; clearInterval(interval); };
  }, []);

  // Filter announcements based on user role and school
  const visibleAnnouncements = announcements.filter((a) => {
    if (dismissed.has(a.id)) return false;
    return shouldShowAnnouncement(a, currentRole, currentUser.schoolId);
  });

  const handleDismiss = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDismissed((prev) => new Set(prev).add(id));
  };

  if (visibleAnnouncements.length === 0) return null;

  // Get the first announcement's config for styling
  const firstAnn = visibleAnnouncements[0];
  const config = typeConfig[firstAnn?.type] || typeConfig.info;
  const Icon = config.icon;

  // Create display content - duplicate for seamless looping
  const displayContent = [
    ...visibleAnnouncements,
    ...visibleAnnouncements,
  ];

  // Calculate animation duration
  const totalWidth = visibleAnnouncements.length * 300;
  const duration = Math.max(20, Math.min(60, totalWidth / 30));

  // Animation loop
  useEffect(() => {
    if (visibleAnnouncements.length === 0 || isPaused) return;

    const interval = setInterval(() => {
      setOffset((prev) => {
        const contentWidth = totalWidth;
        if (prev <= -contentWidth) {
          return 0;
        }
        return prev - 1;
      });
    }, 30);

    return () => clearInterval(interval);
  }, [visibleAnnouncements.length, isPaused, totalWidth]);

  return (
    <div
      className={`relative border-b ${config.borderColor} ${config.bg} overflow-hidden`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="flex items-center gap-3 px-4 py-2 max-w-full">
        {/* Icon */}
        <div className={`shrink-0 w-7 h-7 rounded-full ${config.iconBg} flex items-center justify-center z-10`}>
          <Icon className="h-3.5 w-3.5 text-white" />
        </div>

        {/* Marquee Container - starts from right, scrolls to left */}
        <div className="flex-1 overflow-hidden relative">
          <div
            className="flex items-center"
            style={{
              transform: `translateX(${offset}px)`,
              width: 'max-content',
            }}
          >
            {displayContent.map((ann, idx) => {
              const annConfig = typeConfig[ann.type] || typeConfig.info;
              return (
                <span
                  key={`${ann.id}-${idx}`}
                  className={`${annConfig.textColor} text-sm font-medium whitespace-nowrap flex items-center gap-2 px-6`}
                >
                  <Megaphone className="h-3 w-3 shrink-0 opacity-70" />
                  {ann.title && <span className="font-bold">{ann.title}:</span>}
                  <span>{ann.message}</span>
                  {ann.linkUrl && (
                    <a
                      href={ann.linkUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline hover:opacity-80 ml-2"
                    >
                      Learn more
                    </a>
                  )}
                </span>
              );
            })}
          </div>
          
          {/* Fade gradient on right edge */}
          <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-white to-transparent pointer-events-none" />
        </div>

        {/* Dismiss button */}
        <button
          onClick={(e) => handleDismiss(firstAnn.id, e)}
          className={`shrink-0 p-1 rounded-full hover:bg-black/5 transition-colors ${config.textColor} opacity-60 hover:opacity-100 z-10`}
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}