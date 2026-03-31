'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/shared/status-badge';
import { Skeleton } from '@/components/ui/skeleton';
import { QrCode, ScanLine, UserCheck, BookOpen, ShieldCheck } from 'lucide-react';
import { useAppStore } from '@/store/app-store';
import { toast } from 'sonner';

type ScanType = 'attendance' | 'library' | 'verify';

interface ScanRecord {
  id: string;
  student: string;
  action: string;
  time: string;
  status: string;
}

const scanTypes: { id: ScanType; label: string; icon: React.ElementType }[] = [
  { id: 'attendance', label: 'Attendance', icon: UserCheck },
  { id: 'library', label: 'Library', icon: BookOpen },
  { id: 'verify', label: 'Verify', icon: ShieldCheck },
];

export function IdScannerView() {
  const { selectedSchoolId } = useAppStore();
  const [activeScanType, setActiveScanType] = React.useState<ScanType>('attendance');
  const [scans, setScans] = React.useState<ScanRecord[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!selectedSchoolId) { setLoading(false); return; }
    setLoading(true);
    fetch(`/api/attendance?schoolId=${selectedSchoolId}&limit=20`)
      .then(r => r.json())
      .then(json => {
        const items = (json.data || json || []).slice(0, 15);
        setScans(items.map((a: Record<string, unknown>, idx: number) => ({
          id: a.id || `scan-${idx}`,
          student: a.studentName || a.studentId || `Student ${idx + 1}`,
          action: a.method || 'Attendance',
          time: a.createdAt ? new Date(a.createdAt as string).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—',
          status: a.status || 'success',
        })));
      })
      .catch(() => { toast.error('Failed to load scan history'); setScans([]); })
      .finally(() => setLoading(false));
  }, [selectedSchoolId]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">ID Scanner</h2>
        <p className="text-sm text-muted-foreground">Scan student ID cards for quick actions</p>
      </div>

      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="relative flex flex-col items-center justify-center bg-gray-950 text-white" style={{ minHeight: 320 }}>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-48 h-48 border-2 border-dashed border-emerald-400/50 rounded-2xl animate-pulse" />
            </div>
            <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-[scan_2s_ease-in-out_infinite] pointer-events-none" style={{ marginTop: -40 }} />
            <div className="relative z-10 flex flex-col items-center gap-4">
              <div className="size-20 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center border border-white/20">
                <QrCode className="size-10 text-emerald-400" />
              </div>
              <p className="text-sm text-gray-400 font-medium">Point camera at ID card</p>
              <p className="text-xs text-gray-500">Scanning for: <span className="text-emerald-400">{activeScanType}</span></p>
            </div>
          </div>
          <div className="p-4 border-t bg-muted/30">
            <div className="flex gap-2 justify-center flex-wrap">
              {scanTypes.map(type => (
                <Button key={type.id} variant={activeScanType === type.id ? 'default' : 'outline'} size="sm" className="gap-2" onClick={() => setActiveScanType(type.id)}>
                  <type.icon className="size-4" />
                  {type.label}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}</div>
          ) : scans.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No recent scan activity. Use the scanner to record attendance, library check-ins, or ID verification.</p>
          ) : (
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {scans.map(scan => (
                <div key={scan.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex size-8 items-center justify-center rounded-full bg-muted">
                      <ScanLine className="size-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{scan.student}</p>
                      <p className="text-xs text-muted-foreground">{scan.action} · {scan.time}</p>
                    </div>
                  </div>
                  <StatusBadge variant={scan.status === 'success' ? 'success' : 'error'} size="sm">{scan.status}</StatusBadge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
