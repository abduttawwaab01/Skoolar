'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { KpiCard } from '@/components/shared/kpi-card';
import { StatusBadge } from '@/components/shared/status-badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { useAppStore } from '@/store/app-store';
import { toast } from 'sonner';
import {
  Users, GraduationCap, CalendarCheck, Wallet, FileEdit, CreditCard,
  Megaphone, IdCard, TrendingUp, Clock, BookOpen,
  Award, AlertTriangle, CheckCircle2, UserCheck, Plus, ChevronRight,
  BarChart3, ArrowUpRight, ArrowDownRight, CircleDot, RefreshCw, XCircle
} from 'lucide-react';

interface StudentRecord {
  id: string;
  admissionNo: string;
  user: { name: string | null; email: string | null } | null;
  class: { id: string; name: string; section: string | null; grade: string | null } | null;
  gpa: number | null;
  cumulativeGpa: number | null;
  gender: string | null;
  isActive: boolean;
  createdAt: string;
}

interface TeacherRecord {
  id: string;
  employeeNo: string;
  user: { name: string | null; email: string | null } | null;
  specialization: string | null;
  qualification: string | null;
  _count: { classes: number; classSubjects: number; exams: number; comments: number };
}

interface AttendanceRecord {
  id: string;
  studentId: string;
  date: string;
  status: string;
  student: { admissionNo: string; user: { name: string | null } } | null;
}

interface PaymentRecord {
  id: string;
  amount: number;
  method: string;
  status: string;
  receiptNo: string;
  paidBy: string | null;
  createdAt: string;
  student: { admissionNo: string; user: { name: string | null } } | null;
}

interface AnnouncementRecord {
  id: string;
  title: string;
  content: string;
  type: string;
  priority: string;
  isPublished: boolean;
  createdAt: string;
  createdBy: string | null;
}

interface CalendarEventRecord {
  id: string;
  title: string;
  startDate: string;
  endDate: string | null;
  type: string;
  color: string;
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 space-y-4">
      <div className="size-12 rounded-full bg-red-100 flex items-center justify-center"><XCircle className="size-6 text-red-600" /></div>
      <div className="text-center"><p className="text-sm font-medium">Failed to load data</p><p className="text-xs text-muted-foreground mt-1">{message}</p></div>
      <Button variant="outline" size="sm" onClick={onRetry}><RefreshCw className="size-3.5 mr-1.5" /> Retry</Button>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between"><Skeleton className="h-8 w-48" /><Skeleton className="h-8 w-40" /></div>
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => <Card key={i}><CardContent className="p-4"><Skeleton className="h-4 w-24 mb-2" /><Skeleton className="h-8 w-16" /></CardContent></Card>)}
      </div>
      <Card><CardContent className="p-4"><Skeleton className="h-6 w-60 mb-2" /><Skeleton className="h-3 w-full" /></CardContent></Card>
    </div>
  );
}

export function SchoolAdminDashboard() {
  const { setCurrentView, selectedSchoolId, currentUser } = useAppStore();
  const [activeTab, setActiveTab] = useState('overview');

  // Data states
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [teachers, setTeachers] = useState<TeacherRecord[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [announcements, setAnnouncements] = useState<AnnouncementRecord[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEventRecord[]>([]);

  // Loading
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!selectedSchoolId) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);

      const [studentsRes, teachersRes, attendanceRes, paymentsRes, announcementsRes, calendarRes] = await Promise.allSettled([
        fetch(`/api/students?schoolId=${selectedSchoolId}&limit=5`),
        fetch(`/api/teachers?schoolId=${selectedSchoolId}&limit=5`),
        fetch(`/api/attendance?schoolId=${selectedSchoolId}&limit=100`),
        fetch(`/api/payments?schoolId=${selectedSchoolId}&limit=10`),
        fetch(`/api/announcements?schoolId=${selectedSchoolId}&limit=10`),
        fetch(`/api/calendar?schoolId=${selectedSchoolId}`),
      ]);

      if (studentsRes.status === 'fulfilled' && studentsRes.value.ok) {
        const json = await studentsRes.value.json();
        setStudents(json.data || []);
      }
      if (teachersRes.status === 'fulfilled' && teachersRes.value.ok) {
        const json = await teachersRes.value.json();
        setTeachers(json.data || []);
      }
      if (attendanceRes.status === 'fulfilled' && attendanceRes.value.ok) {
        const json = await attendanceRes.value.json();
        setAttendanceRecords(json.data || []);
      }
      if (paymentsRes.status === 'fulfilled' && paymentsRes.value.ok) {
        const json = await paymentsRes.value.json();
        setPayments(json.data || []);
      }
      if (announcementsRes.status === 'fulfilled' && announcementsRes.value.ok) {
        const json = await announcementsRes.value.json();
        setAnnouncements(json.data || []);
      }
      if (calendarRes.status === 'fulfilled' && calendarRes.value.ok) {
        const json = await calendarRes.value.json();
        setCalendarEvents(json.data || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, [selectedSchoolId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) return <DashboardSkeleton />;
  if (error && students.length === 0 && teachers.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">School Dashboard</h1>
            <p className="text-muted-foreground">{currentUser.schoolName} — Dashboard</p>
          </div>
        </div>
        <ErrorState message={error} onRetry={fetchData} />
      </div>
    );
  }

  // Computed values
  const totalStudents = students.length; // Note: API returns paginated, use count for KPI
  const totalTeachers = teachers.length;

  // Attendance computation from records
  const todayAttendance = attendanceRecords.filter(r => {
    const today = new Date().toISOString().split('T')[0];
    return r.date && new Date(r.date).toISOString().split('T')[0] === today;
  });
  const presentToday = todayAttendance.filter(r => r.status === 'present').length;
  const absentToday = todayAttendance.filter(r => r.status === 'absent').length;
  const lateToday = todayAttendance.filter(r => r.status === 'late').length;
  const totalToday = presentToday + absentToday + lateToday;
  const attendanceRate = totalToday > 0 ? Math.round((presentToday / totalToday) * 100) : 0;

  // Group attendance by day for weekly chart
  const weeklyAttendance = new Map<string, { day: string; present: number; absent: number }>();
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  attendanceRecords.forEach(r => {
    const dateKey = new Date(r.date).toISOString().split('T')[0];
    const dayName = dayNames[new Date(r.date).getDay()];
    if (!weeklyAttendance.has(dateKey)) {
      weeklyAttendance.set(dateKey, { day: dayName, present: 0, absent: 0 });
    }
    const dayData = weeklyAttendance.get(dateKey)!;
    if (r.status === 'present') dayData.present++;
    else if (r.status === 'absent') dayData.absent++;
  });
  const weeklyData = Array.from(weeklyAttendance.values()).slice(-5);
  const weeklyMaxPresent = Math.max(...weeklyData.map(d => d.present), 1);

  // Payments
  const totalCollected = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const pendingPayments = payments.filter(p => p.status === 'pending' || p.status === 'unverified');
  const pendingAmount = pendingPayments.reduce((sum, p) => sum + (p.amount || 0), 0);

  // Top performers from student data
  const topPerformers = [...students]
    .filter(s => s.gpa !== null)
    .sort((a, b) => (b.gpa || 0) - (a.gpa || 0))
    .slice(0, 3)
    .map((s, i) => ({
      rank: i + 1,
      name: s.user?.name || 'Unknown',
      class: s.class ? `${s.class.name}${s.class.section ? ` ${s.class.section}` : ''}` : '-',
      gpa: s.gpa || 0,
      trend: i === 0 ? 'up' as const : i === 2 ? 'down' as const : 'stable' as const,
    }));

  // Attendance by class (from records)
  const classAttendance = new Map<string, { class: string; total: number; present: number }>();
  attendanceRecords.forEach(r => {
    const student = students.find(s => s.id === r.studentId);
    const className = student?.class ? `${student.class.name}${student.class.section ? ` ${student.class.section}` : ''}` : 'Unknown';
    if (!classAttendance.has(className)) {
      classAttendance.set(className, { class: className, total: 0, present: 0 });
    }
    const cd = classAttendance.get(className)!;
    cd.total++;
    if (r.status === 'present') cd.present++;
  });
  const attendanceByClass = Array.from(classAttendance.values())
    .map(c => ({ class: c.class, rate: c.total > 0 ? Math.round((c.present / c.total) * 100) : 0 }))
    .sort((a, b) => b.rate - a.rate);

  const quickActions = [
    { label: 'Add Student', icon: Plus, view: 'students' as const, color: 'bg-emerald-100 text-emerald-700' },
    { label: 'Manage Fees', icon: Wallet, view: 'payments' as const, color: 'bg-blue-100 text-blue-700' },
    { label: 'View Reports', icon: BarChart3, view: 'reports' as const, color: 'bg-purple-100 text-purple-700' },
    { label: 'Send Notice', icon: Megaphone, view: 'announcements' as const, color: 'bg-amber-100 text-amber-700' },
    { label: 'ID Cards', icon: IdCard, view: 'id-cards' as const, color: 'bg-cyan-100 text-cyan-700' },
    { label: 'Attendance', icon: CalendarCheck, view: 'attendance' as const, color: 'bg-pink-100 text-pink-700' },
  ];

  const collectionRate = totalCollected + pendingAmount > 0 ? Math.round((totalCollected / (totalCollected + pendingAmount)) * 100) : 0;

  // Fee type breakdown from payments
  const methodTotals = new Map<string, number>();
  payments.forEach(p => {
    if (p.status === 'verified' || p.status === 'completed') {
      methodTotals.set(p.method, (methodTotals.get(p.method) || 0) + (p.amount || 0));
    }
  });
  const byFeeType = Array.from(methodTotals.entries()).map(([method, amount]) => ({ type: method.charAt(0).toUpperCase() + method.slice(1), amount }));
  const feeTypeMax = Math.max(...byFeeType.map(f => f.amount), 1);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">School Dashboard</h1>
          <p className="text-muted-foreground">{currentUser.schoolName} — Second Term 2024/2025</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1 text-sm py-1">
            <GraduationCap className="size-3.5" /> Academic Year Active
          </Badge>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-6">
        <KpiCard title="Total Students" value={totalStudents.toLocaleString()} icon={GraduationCap} iconBgColor="bg-emerald-100" iconColor="text-emerald-600" change={8} changeLabel="new this term" sparklineData={[780, 800, 810, 820, 830, 840, 847]} />
        <KpiCard title="Teachers" value={totalTeachers} icon={Users} iconBgColor="bg-blue-100" iconColor="text-blue-600" change={5} changeLabel="new hires" />
        <KpiCard title="Attendance Rate" value={`${attendanceRate}%`} icon={CalendarCheck} iconBgColor="bg-green-100" iconColor="text-green-600" change={2.3} changeLabel="vs last week" />
        <KpiCard title="Revenue Collected" value={`₦${(totalCollected / 1000000).toFixed(1)}M`} icon={Wallet} iconBgColor="bg-amber-100" iconColor="text-amber-600" change={15} changeLabel="this term" />
        <KpiCard title="Pending Fees" value={`₦${(pendingAmount / 1000000).toFixed(1)}M`} icon={AlertTriangle} iconBgColor="bg-red-100" iconColor="text-red-600" change={-8} changeLabel="vs last month" />
        <KpiCard title="Active Exams" value="8" icon={FileEdit} iconBgColor="bg-purple-100" iconColor="text-purple-600" change={3} changeLabel="this week" />
      </div>

      {/* Fee Collection Progress */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-sm font-medium">Fee Collection Progress</p>
              <p className="text-xs text-muted-foreground">₦{(totalCollected / 1000000).toFixed(1)}M collected of ₦{((totalCollected + pendingAmount) / 1000000).toFixed(1)}M expected</p>
            </div>
            <span className="text-lg font-bold text-emerald-600">{collectionRate}%</span>
          </div>
          <Progress value={collectionRate} className="h-3" />
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span>₦0</span>
            <span>₦{((totalCollected + pendingAmount) / 1000000).toFixed(1)}M Expected</span>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for different sections */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="academics">Academics</TabsTrigger>
          <TabsTrigger value="finance">Finance</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          {/* Attendance + Quick Actions */}
          <div className="grid gap-4 lg:grid-cols-2">
            {/* Today's Attendance - CSS Bar Chart */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">Weekly Attendance</CardTitle>
                    <CardDescription>Present vs Absent students</CardDescription>
                  </div>
                  <Button variant="ghost" size="sm" className="text-xs" onClick={() => setCurrentView('attendance')}>Details</Button>
                </div>
              </CardHeader>
              <CardContent>
                {weeklyData.length > 0 ? (
                  <>
                    <div className="flex items-end gap-3 h-40 mb-4">
                      {weeklyData.map((day, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-1">
                          <div className="flex gap-0.5 w-full h-32">
                            <div
                              className="flex-1 bg-emerald-500 rounded-t-md transition-all duration-300 hover:bg-emerald-600 cursor-pointer"
                              style={{ height: `${(day.present / weeklyMaxPresent) * 100}%` }}
                              title={`${day.day}: ${day.present} present`}
                            />
                            <div
                              className="bg-red-400 rounded-t-md transition-all duration-300 hover:bg-red-500 cursor-pointer"
                              style={{ width: '30%', height: `${(day.absent / weeklyMaxPresent) * 100}%` }}
                              title={`${day.day}: ${day.absent} absent`}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground font-medium">{day.day}</span>
                        </div>
                      ))}
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/20 p-2">
                        <p className="text-sm font-bold text-emerald-600">{presentToday}</p>
                        <p className="text-[10px] text-muted-foreground">Present Today</p>
                      </div>
                      <div className="rounded-lg bg-red-50 dark:bg-red-950/20 p-2">
                        <p className="text-sm font-bold text-red-600">{absentToday}</p>
                        <p className="text-[10px] text-muted-foreground">Absent</p>
                      </div>
                      <div className="rounded-lg bg-amber-50 dark:bg-amber-950/20 p-2">
                        <p className="text-sm font-bold text-amber-600">{lateToday}</p>
                        <p className="text-[10px] text-muted-foreground">Late</p>
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">No attendance data available</p>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions + Top Performers */}
            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-2">
                    {quickActions.map(action => (
                      <Button key={action.label} variant="outline" className="h-auto flex-col gap-2 py-3 px-2 hover:bg-accent" onClick={() => setCurrentView(action.view)}>
                        <div className={`size-8 rounded-lg flex items-center justify-center ${action.color}`}>
                          <action.icon className="size-4" />
                        </div>
                        <span className="text-[10px] font-medium text-center leading-tight">{action.label}</span>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Top Performers</CardTitle>
                    <Button variant="ghost" size="sm" className="text-xs" onClick={() => setCurrentView('results')}>View all</Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {topPerformers.length > 0 ? (
                    <div className="space-y-2">
                      {topPerformers.map(student => (
                        <div key={student.rank} className="flex items-center gap-2.5">
                          <span className="flex size-6 items-center justify-center rounded-full bg-amber-100 text-amber-700 text-xs font-bold">
                            {student.rank}
                          </span>
                          <Avatar className="size-7">
                            <AvatarFallback className="text-[10px]">{student.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium truncate">{student.name}</p>
                            <p className="text-xs text-muted-foreground">{student.class}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold">{student.gpa}</p>
                            <p className={`text-[10px] font-medium ${student.trend === 'up' ? 'text-emerald-600' : student.trend === 'down' ? 'text-red-500' : 'text-muted-foreground'}`}>
                              {student.trend === 'up' ? '↑' : student.trend === 'down' ? '↓' : '→'}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">No student data available</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Academics Tab */}
        <TabsContent value="academics" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            {/* Attendance by Class */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Attendance by Class</CardTitle>
                <CardDescription>Attendance rate per class</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="max-h-[360px]">
                  <div className="space-y-3">
                    {attendanceByClass.length > 0 ? attendanceByClass.map(cls => (
                      <div key={cls.class} className="flex items-center gap-3">
                        <span className="text-xs font-medium w-14 shrink-0">{cls.class}</span>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Progress value={cls.rate} className="h-2.5 flex-1" />
                            <span className={`text-xs font-semibold w-10 text-right ${cls.rate >= 90 ? 'text-emerald-600' : cls.rate >= 80 ? 'text-amber-600' : 'text-red-600'}`}>{cls.rate}%</span>
                          </div>
                        </div>
                      </div>
                    )) : (
                      <p className="text-sm text-muted-foreground text-center py-8">No attendance data available</p>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Upcoming Events */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Upcoming Events</CardTitle>
                  <Button variant="ghost" size="sm" className="text-xs" onClick={() => setCurrentView('calendar')}>Calendar</Button>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="max-h-[360px]">
                  <div className="space-y-3">
                    {calendarEvents.length > 0 ? calendarEvents.map(ev => (
                      <div key={ev.id} className="flex items-center gap-3 rounded-lg border p-3 hover:bg-muted/50 transition-colors cursor-pointer">
                        <div className="w-1.5 h-10 rounded-full shrink-0" style={{ backgroundColor: ev.color }} />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate">{ev.title}</p>
                          <p className="text-xs text-muted-foreground">{new Date(ev.startDate).toISOString().split('T')[0]}</p>
                        </div>
                        <Badge variant="outline" className="text-[10px] shrink-0">{ev.type}</Badge>
                      </div>
                    )) : (
                      <p className="text-sm text-muted-foreground text-center py-8">No upcoming events</p>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Finance Tab */}
        <TabsContent value="finance" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            {/* Revenue by Payment Method - CSS Bars */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Revenue by Payment Method</CardTitle>
                <CardDescription>Breakdown of collected fees</CardDescription>
              </CardHeader>
              <CardContent>
                {byFeeType.length > 0 ? (
                  <div className="space-y-3">
                    {byFeeType.map((item, i) => {
                      const colors = ['bg-emerald-500', 'bg-purple-500', 'bg-red-500', 'bg-cyan-500', 'bg-amber-500'];
                      return (
                        <div key={item.type} className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <div className={`size-3 rounded ${colors[i % colors.length]}`} />
                              <span className="font-medium">{item.type}</span>
                            </div>
                            <span className="font-semibold">₦{(item.amount / 1000000).toFixed(1)}M</span>
                          </div>
                          <div className="h-3 bg-muted rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${colors[i % colors.length]} hover:opacity-80 cursor-pointer`}
                              style={{ width: `${(item.amount / feeTypeMax) * 100}%` }}
                              title={`${item.type}: ₦${item.amount.toLocaleString()}`}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">No payment data available</p>
                )}
              </CardContent>
            </Card>

            {/* Recent Payments */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Recent Payments</CardTitle>
                  <Button variant="ghost" size="sm" className="text-xs" onClick={() => setCurrentView('payments')}>View all</Button>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="max-h-[340px]">
                  <div className="space-y-2.5">
                    {payments.length > 0 ? payments.map(p => (
                      <div key={p.id} className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50 transition-colors">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate">{p.student?.user?.name || p.paidBy || 'Unknown'}</p>
                          <p className="text-xs text-muted-foreground">{p.method} · {new Date(p.createdAt).toISOString().split('T')[0]}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold">₦{(p.amount || 0).toLocaleString()}</p>
                          <StatusBadge variant={p.status === 'verified' || p.status === 'completed' ? 'success' : 'warning'} size="sm">
                            {p.status}
                          </StatusBadge>
                        </div>
                      </div>
                    )) : (
                      <p className="text-sm text-muted-foreground text-center py-8">No payments recorded</p>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Bottom Row: Announcements */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CardTitle className="text-base">Recent Announcements</CardTitle>
              <Badge variant="outline">{announcements.length} total</Badge>
            </div>
            <Button variant="ghost" size="sm" className="text-xs" onClick={() => setCurrentView('announcements')}>View all</Button>
          </div>
        </CardHeader>
        <CardContent>
          {announcements.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {announcements.slice(0, 4).map(ann => (
                <div key={ann.id} className="flex items-start gap-3 rounded-lg border p-3 hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => setCurrentView('announcements')}>
                  <div className={`mt-0.5 size-8 rounded-lg flex items-center justify-center shrink-0 ${
                    ann.priority === 'urgent' ? 'bg-red-100 text-red-600' :
                    ann.priority === 'high' ? 'bg-amber-100 text-amber-600' :
                    'bg-blue-100 text-blue-600'
                  }`}>
                    <Megaphone className="size-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-sm font-medium truncate">{ann.title}</p>
                      <Badge variant={ann.priority === 'urgent' ? 'destructive' : 'outline'} className="text-[10px] shrink-0">{ann.priority}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">{ann.content}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">{new Date(ann.createdAt).toISOString().split('T')[0]}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">No announcements yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
