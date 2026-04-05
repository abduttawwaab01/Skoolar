'use client';

import { useEffect, useState, useRef } from 'react';
import { X, Info, AlertTriangle, AlertCircle, CheckCircle2, Megaphone } from 'lucide-react';
import { handleSilentError } from '@/lib/error-handler';

interface PlatformAnnouncement {
  id: string;
  title: string | null;
  message: string;
  type: string;
  linkUrl?: string;
  isActive: boolean;
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

export function AnnouncementTicker() {
  const [announcements, setAnnouncements] = useState<PlatformAnnouncement[]>([]);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [isPaused, setIsPaused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

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

  const visibleAnnouncements = announcements.filter((a) => !dismissed.has(a.id) && a.isActive);

  const handleDismiss = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDismissed((prev) => new Set(prev).add(id));
  };

  if (visibleAnnouncements.length === 0) return null;

  // Get the first announcement's config for styling
  const firstAnn = visibleAnnouncements[0];
  const config = typeConfig[firstAnn?.type] || typeConfig.info;
  const Icon = config.icon;

  // Create the display content - single set for clean display
  const displayContent = visibleAnnouncements.map((ann) => {
    const annConfig = typeConfig[ann.type] || typeConfig.info;
    const AnnIcon = annConfig.icon;
    
    const content = (
      <span key={ann.id} className="flex items-center gap-2 shrink-0">
        <Megaphone className="h-3 w-3 shrink-0 opacity-70" />
        {ann.title && <span className="font-bold">{ann.title}:</span>}
        <span>{ann.message}</span>
        {ann.linkUrl && (
          <a href={ann.linkUrl} target="_blank" rel="noopener noreferrer" className="underline hover:opacity-80">
            Learn more
          </a>
        )}
      </span>
    );
    
    return { content, config: annConfig, icon: AnnIcon };
  });

  // Calculate animation duration based on content length
  const totalLength = displayContent.reduce((acc, item) => acc + 200, 0); // Approximate width
  const duration = Math.max(15, Math.min(30, totalLength / 20)); // 15-30 seconds based on content

  return (
    <div
      className={`relative border-b ${config.borderColor} ${config.bg} overflow-hidden`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="flex items-center gap-3 px-4 py-2 max-w-full">
        {/* Icon - shows first announcement type */}
        <div className={`shrink-0 w-7 h-7 rounded-full ${config.iconBg} flex items-center justify-center z-10`}>
          <Icon className="h-3.5 w-3.5 text-white" />
        </div>

        {/* Marquee Container */}
        <div className="flex-1 overflow-hidden mask-gradient">
          <div
            ref={containerRef}
            className="flex items-center"
            style={{
              animation: isPaused ? 'none' : `marquee ${duration}s linear infinite`,
              width: 'max-content',
            }}
          >
            {displayContent.map((item, idx) => (
              <span key={idx} className={`${item.config.textColor} text-sm font-medium whitespace-nowrap px-4`}>
                {item.content}
              </span>
            ))}
          </div>
        </div>

        {/* Dismiss button */}
        <button
          onClick={(e) => handleDismiss(firstAnn.id, e)}
          className={`shrink-0 p-1 rounded-full hover:bg-black/5 transition-colors ${config.textColor} opacity-60 hover:opacity-100 z-10`}
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* CSS for smooth marquee animation */}
      <style jsx>{`
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        
        .mask-gradient {
          mask-image: linear-gradient(to right, transparent, black 5%, black 95%, transparent);
          -webkit-mask-image: linear-gradient(to right, transparent, black 5%, black 95%, transparent);
        }
      `}</style>
    </div>
  );
}