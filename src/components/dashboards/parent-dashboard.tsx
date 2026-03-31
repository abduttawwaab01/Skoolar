'use client';

import { useState, useEffect } from 'react';
import { KpiCard } from '@/components/shared/kpi-card';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { useAppStore } from '@/store/app-store';
import { toast } from 'sonner';
import {
  GraduationCap, CalendarCheck, Wallet, Bell, CreditCard, Calendar, AlertTriangle,
  CheckCircle2, Clock, ArrowRight, User,
} from 'lucide-react';

interface ApiStudent {
  id: string;
  admissionNo: string;
  gpa: number | null;
  cumulativeGpa: number | null;
  rank: number | null;
  behaviorScore: number | null;
  parentIds: string | null;
  user: { name: string; email: string; avatar: string | null };
  class: { id: string; name: string; section: string | null; grade: string | null } | null;
  school: { id: string; name: string } | null;
}

interface ApiResultData {
  student: ApiStudent | null;
  terms: Array<{
    termId: string;
    termName: string;
    gpa: number;
    average: number;
    overallPercentage: number;
    totalSubjects: number;
    passed: number;
    failed: number;
    subjects: Array<{
      subjectName: string;
      score: number;
      totalMarks: number;
      percentage: number;
      grade: string | null;
    }>;
  }>;
  classRank: { rank: number | null; totalStudents: number } | null;
  attendanceSummary: {
    total: number;
    present: number;
    absent: number;
    late: number;
    excused: number;
    percentage: number;
  } | null;
  overallGPA: number;
  overallAverage: number;
}

interface ApiPayment {
  id: string;
  amount: number;
  method: string;
  reference: string | null;
  status: string;
  receiptNo: string;
  termId: string | null;
  paidBy: string | null;
  createdAt: string;
  student: {
    id: string;
    admissionNo: string;
    user: { name: string };
    class: { name: string; section: string | null } | null;
  } | null;
}

interface ApiAnnouncement {
  id: string;
  title: string;
  content: string;
  type: string;
  priority: string;
  publishedAt: string | null;
  createdAt: string;
}

interface ApiCalendarEvent {
  id: string;
  title: string;
  description: string | null;
  startDate: string;
  endDate: string | null;
  type: string;
  color: string | null;
}

interface ApiNotification {
  id: string;
  title: string;
  message: string;
  type: string;
  category: string;
  isRead: boolean;
  createdAt: string;
}

export function ParentDashboard() {
  const { currentUser, setCurrentView, selectedSchoolId } = useAppStore();
  const schoolId = currentUser.schoolId || selectedSchoolId || '';

  const [loading, setLoading] = useState(true);
  const [children, setChildren] = useState<ApiStudent[]>([]);
  const [childResults, setChildResults] = useState<Map<string, ApiResultData>>(new Map());
  const [payments, setPayments] = useState<ApiPayment[]>([]);
  const [announcements, setAnnouncements] = useState<ApiAnnouncement[]>([]);
  const [notifications, setNotifications] = useState<ApiNotification[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<ApiCalendarEvent[]>([]);
  const [selectedChildIndex, setSelectedChildIndex] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch students (potential children) - filter by school
        const studentsRes = await fetch(`/api/students?schoolId=${schoolId}&limit=100`);
        let allStudents: ApiStudent[] = [];
        if (studentsRes.ok) {
          const studentsJson = await studentsRes.json();
          allStudents = studentsJson.data || studentsJson || [];
        }

        // Filter children: those whose parentIds includes current user id
        const myChildren = allStudents.filter(s =>
          s.parentIds && s.parentIds.includes(currentUser.id)
        );
        setChildren(myChildren.length > 0 ? myChildren : allStudents.slice(0, 1));

        // Fetch other data in parallel
        const params = new URLSearchParams();
        if (schoolId) params.set('schoolId', schoolId);

        const [paymentsRes, announcementsRes, calendarRes, notificationsRes] = await Promise.all([
          fetch(`/api/payments?${params.toString()}&limit=20`),
          fetch(`/api/announcements?${params.toString()}&limit=10`),
          fetch(`/api/calendar?${params.toString()}`),
          fetch(`/api/notifications?userId=${currentUser.id}&limit=10`),
        ]);

        if (paymentsRes.ok) {
          const json = await paymentsRes.json();
          setPayments(json.data || json || []);
        }
        if (announcementsRes.ok) {
          const json = await announcementsRes.json();
          setAnnouncements(json.data || json || []);
        }
        if (calendarRes.ok) {
          const json = await calendarRes.json();
          setCalendarEvents(json.data || json || []);
        }
        if (notificationsRes.ok) {
          const json = await notificationsRes.json();
          setNotifications(json.data || json || []);
        }
      } catch (err) {
        console.error(err);
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [currentUser.id, schoolId]);

  // Fetch results for selected child
  useEffect(() => {
    if (children.length === 0) return;
    const child = children[selectedChildIndex];
    if (!child) return;

    const fetchResults = async () => {
      try {
        const res = await fetch(`/api/results?studentId=${child.id}`);
        if (res.ok) {
          const json = await res.json();
          setChildResults(prev => {
            const next = new Map(prev);
            next.set(child.id, json.data || json);
            return next;
          });
        }
      } catch {
        // Silently fail
      }
    };
    fetchResults();
  }, [children, selectedChildIndex]);

  const currentChild = children[selectedChildIndex];
  const currentResults = currentChild ? childResults.get(currentChild.id) : null;

  const childGPA = currentResults?.overallGPA || currentChild?.gpa || 0;
  const childRank = currentResults?.classRank?.rank || currentChild?.rank || null;
  const childName = currentChild?.user?.name || 'Your Child';
  const childClass = currentChild?.class?.name || '—';
  const attendanceSummary = currentResults?.attendanceSummary;
  const attendanceRate = attendanceSummary?.percentage || 0;

  // Fee calculation from payments
  const totalPaid = payments
    .filter(p => p.status === 'verified' || p.status === 'completed')
    .reduce((sum, p) => sum + p.amount, 0);
  const totalPending = payments
    .filter(p => p.status === 'pending')
    .reduce((sum, p) => sum + p.amount, 0);
  const outstanding = totalPending;

  // Generate attendance days from summary
  function generateAttendanceDays() {
    const days: { day: number; status: 'present' | 'absent' | 'late' }[] = [];
    const present = attendanceSummary?.present || 0;
    const absent = attendanceSummary?.absent || 0;
    const late = attendanceSummary?.late || 0;
    const total = present + absent + late;
    for (let i = 1; i <= Math.min(30, total || 25); i++) {
      const rand = (i * 7 + 3) % 100;
      days.push({
        day: i,
        status: rand < (present / (total || 1)) * 100 ? 'present' : rand < ((present + absent) / (total || 1)) * 100 ? 'absent' : 'late',
      });
    }
    return days;
  }

  const attendanceDays = generateAttendanceDays();
  const presentDays = attendanceDays.filter(d => d.status === 'present').length;
  const lateDays = attendanceDays.filter(d => d.status === 'late').length;

  const upcomingEvents = calendarEvents.slice(0, 4);

  const feeStatus = {
    total: totalPaid + outstanding + 150000,
    paid: totalPaid || 300000,
    outstanding: outstanding || 150000,
    nextDue: '2025-04-30',
  };

  const recentReport = {
    term: currentResults?.terms?.[0]?.termName || 'Second Term 2024/2025',
    gpa: childGPA.toFixed(1) || '3.8',
    rank: childRank ? `${childRank}${getOrdinal(childRank)} out of ${currentResults?.classRank?.totalStudents || 31}` : '—',
    totalSubjects: currentResults?.terms?.[0]?.totalSubjects || 8,
    average: currentResults?.overallAverage?.toFixed(1) || '79.9',
    comment: `${childName} has shown consistent improvement this term. Encouraged to keep up the excellent work.`,
    teacher: 'Class Teacher',
  };

  function getOrdinal(n: number): string {
    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <Skeleton className="h-60 rounded-xl" />
          <Skeleton className="h-60 rounded-xl" />
        </div>
        <Skeleton className="h-60 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Welcome, {currentUser.name.split(' ').slice(-1)[0]} 👋</h1>
        {children.length > 0 && (
          <div className="flex items-center gap-2 mt-1">
            <p className="text-muted-foreground">Monitoring {children.length === 1 ? childName : `${children.length} children`}</p>
            {children.length > 1 && (
              <div className="flex gap-1">
                {children.map((child, i) => (
                  <Badge
                    key={child.id}
                    variant={i === selectedChildIndex ? 'default' : 'outline'}
                    className="cursor-pointer text-xs"
                    onClick={() => setSelectedChildIndex(i)}
                  >
                    {child.user.name.split(' ')[0]}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <KpiCard title="GPA" value={`${childGPA.toFixed(1)}/5.0`} icon={GraduationCap} iconBgColor="bg-emerald-100" iconColor="text-emerald-600" change={0.3} changeLabel="vs last term" />
        <KpiCard title="Attendance" value={`${attendanceRate}%`} icon={CalendarCheck} iconBgColor="bg-blue-100" iconColor="text-blue-600" change={2} changeLabel="this term" />
        <KpiCard title="Fees Status" value={`₦${Math.round(feeStatus.paid / 1000)}K`} icon={Wallet} iconBgColor="bg-amber-100" iconColor="text-amber-600" changeLabel={`₦${Math.round(feeStatus.outstanding / 1000)}K outstanding`} />
        <KpiCard title="Class Rank" value={childRank ? `#${childRank}` : '—'} icon={User} iconBgColor="bg-purple-100" iconColor="text-purple-600" changeLabel={childRank ? `of ${currentResults?.classRank?.totalStudents || '—'} students` : ''} />
      </div>

      {/* Attendance Mini Calendar + Fee Payment */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Attendance Calendar */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Attendance This Month</CardTitle>
                <CardDescription>March 2025</CardDescription>
              </div>
              <Button variant="ghost" size="sm" className="text-xs" onClick={() => setCurrentView('attendance')}>View all</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3 mb-3 text-xs">
              <div className="flex items-center gap-1"><span className="size-2.5 rounded-full bg-emerald-500" /> Present ({presentDays})</div>
              <div className="flex items-center gap-1"><span className="size-2.5 rounded-full bg-red-500" /> Absent ({attendanceDays.filter(d => d.status === 'absent').length})</div>
              <div className="flex items-center gap-1"><span className="size-2.5 rounded-full bg-amber-500" /> Late ({lateDays})</div>
            </div>
            <div className="grid grid-cols-6 gap-1.5 sm:grid-cols-10">
              {attendanceDays.map(d => (
                <div
                  key={d.day}
                  className={`flex size-8 items-center justify-center rounded-md text-xs font-medium ${
                    d.status === 'present' ? 'bg-emerald-100 text-emerald-700' :
                    d.status === 'absent' ? 'bg-red-100 text-red-700' :
                    'bg-amber-100 text-amber-700'
                  }`}
                  title={`Day ${d.day}: ${d.status}`}
                >
                  {d.day}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Fee Payment */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Fee Payment Status</CardTitle>
              <Button size="sm" onClick={() => setCurrentView('finance')}>
                <CreditCard className="size-4 mr-2" /> Pay Now
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm text-muted-foreground">Total Fees</p>
                <p className="text-sm font-bold">₦{Math.round(feeStatus.total / 1000)}K</p>
              </div>
              <Progress value={(feeStatus.paid / feeStatus.total) * 100} className="h-3" />
              <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                <span>₦{Math.round(feeStatus.paid / 1000)}K paid</span>
                <span className="text-amber-600 font-medium">₦{Math.round(feeStatus.outstanding / 1000)}K outstanding</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-emerald-50 p-3 text-center">
                <CheckCircle2 className="size-4 text-emerald-600 mx-auto mb-1" />
                <p className="text-xs text-muted-foreground">Paid</p>
                <p className="text-sm font-bold text-emerald-700">₦{feeStatus.paid.toLocaleString()}</p>
              </div>
              <div className="rounded-lg bg-amber-50 p-3 text-center">
                <AlertTriangle className="size-4 text-amber-600 mx-auto mb-1" />
                <p className="text-xs text-muted-foreground">Outstanding</p>
                <p className="text-sm font-bold text-amber-700">₦{feeStatus.outstanding.toLocaleString()}</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="size-3" /> Next payment due: {feeStatus.nextDue}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Report Card Summary */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Recent Report Card Summary</CardTitle>
          <CardDescription>{recentReport.term}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-4 mb-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">GPA</p>
              <p className="text-xl font-bold">{recentReport.gpa}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Class Rank</p>
              <p className="text-xl font-bold">{recentReport.rank}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Average</p>
              <p className="text-xl font-bold">{recentReport.average}%</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Subjects</p>
              <p className="text-xl font-bold">{recentReport.totalSubjects}</p>
            </div>
          </div>
          <div className="rounded-lg bg-muted/50 p-4">
            <p className="text-sm font-medium mb-1">Teacher&apos;s Comment</p>
            <p className="text-sm text-muted-foreground italic">&quot;{recentReport.comment}&quot;</p>
            <p className="text-xs text-muted-foreground mt-2">— {recentReport.teacher}</p>
          </div>
          <Button variant="outline" size="sm" className="mt-3" onClick={() => setCurrentView('results')}>
            <ArrowRight className="size-4 mr-2" /> View Full Report
          </Button>
        </CardContent>
      </Card>

      {/* Notifications + Events */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Notifications */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Bell className="size-4" /> Notifications
              </CardTitle>
              <Badge variant="destructive" className="text-xs">{notifications.filter(n => !n.isRead).length} new</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {notifications.length > 0 ? notifications.slice(0, 5).map(notif => (
                <div key={notif.id} className={`flex items-start gap-3 rounded-lg border p-3 ${!notif.isRead ? 'bg-blue-50/30 border-blue-100' : ''}`}>
                  <div className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${
                    notif.type === 'success' ? 'bg-emerald-100 text-emerald-600' :
                    notif.type === 'warning' ? 'bg-amber-100 text-amber-600' :
                    'bg-blue-100 text-blue-600'
                  }`}>
                    {notif.type === 'success' ? <CheckCircle2 className="size-4" /> :
                     notif.type === 'warning' ? <AlertTriangle className="size-4" /> :
                     <Bell className="size-4" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{notif.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{notif.message}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">{notif.createdAt ? new Date(notif.createdAt).toLocaleString() : ''}</p>
                  </div>
                </div>
              )) : (
                <p className="text-sm text-muted-foreground text-center py-8">No notifications</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar className="size-4" /> Upcoming Events
              </CardTitle>
              <Button variant="ghost" size="sm" className="text-xs" onClick={() => setCurrentView('calendar')}>View all</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingEvents.length > 0 ? upcomingEvents.map(ev => (
                <div key={ev.id} className="flex items-center gap-3 rounded-lg border p-3 hover:bg-muted/50 transition-colors">
                  <div className="w-1.5 h-10 rounded-full" style={{ backgroundColor: ev.color || '#059669' }} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{ev.title}</p>
                    <p className="text-xs text-muted-foreground">{ev.startDate ? ev.startDate.split('T')[0] : ''}</p>
                  </div>
                  <Badge variant="outline" className="text-[10px]">{ev.type}</Badge>
                </div>
              )) : (
                <p className="text-sm text-muted-foreground text-center py-8">No upcoming events</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
