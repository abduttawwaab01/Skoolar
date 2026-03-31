'use client';

import React, { useState, useEffect } from 'react';
import { KpiCard } from '@/components/shared/kpi-card';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { useAppStore } from '@/store/app-store';
import { toast } from 'sonner';
import {
  Users, GraduationCap, FileEdit, CalendarCheck, Clock, BookOpen,
  AlertTriangle, Megaphone, Sparkles, ChevronRight, CheckCircle2,
  XCircle, CircleDot, ClipboardCheck, Eye, BarChart3
} from 'lucide-react';

const todaySchedule = [
  { time: '08:00 - 09:00', subject: 'Mathematics', class: 'JSS 1A', room: 'Room 101', status: 'completed' as const },
  { time: '09:15 - 10:15', subject: 'Mathematics', class: 'JSS 1B', room: 'Room 102', status: 'completed' as const },
  { time: '10:30 - 11:30', subject: 'Mathematics', class: 'JSS 2A', room: 'Room 201', status: 'in-progress' as const },
  { time: '12:00 - 01:00', subject: 'Free Period', class: '-', room: '-', status: 'upcoming' as const },
  { time: '02:00 - 03:00', subject: 'Mathematics', class: 'SS 1A', room: 'Room 301', status: 'upcoming' as const },
];

const performanceAlerts = [
  { name: 'Tobi Adeyemi', class: 'JSS 2A', issue: 'Score below 50% in Mathematics', type: 'warning' as const, avatar: 'TA' },
  { name: 'Chinedu Okafor', class: 'JSS 1B', issue: '3 consecutive absences this week', type: 'error' as const, avatar: 'CO' },
  { name: 'Emeka Nwankwo', class: 'SS 1A', issue: 'Score below 50% in Mathematics', type: 'warning' as const, avatar: 'EN' },
  { name: 'Samuel Adebanjo', class: 'SS 2A', issue: 'Declining performance trend', type: 'warning' as const, avatar: 'SA' },
];

const pendingGrading = [
  { class: 'JSS 1A', subject: 'Mathematics', type: 'CA2', students: 32, submitted: 28, dueDate: '2025-03-30' },
  { class: 'JSS 1B', subject: 'Mathematics', type: 'Assignment', students: 30, submitted: 25, dueDate: '2025-03-31' },
  { class: 'JSS 2A', subject: 'Mathematics', type: 'Quiz', students: 35, submitted: 35, dueDate: '2025-03-28' },
  { class: 'SS 1A', subject: 'Mathematics', type: 'CA2', students: 28, submitted: 20, dueDate: '2025-04-02' },
];

const classPerformanceData = [
  { class: 'JSS 1A', average: 78, students: 32 },
  { class: 'JSS 1B', average: 72, students: 30 },
  { class: 'JSS 2A', average: 81, students: 35 },
  { class: 'SS 1A', average: 85, students: 28 },
];

const quickActions = [
  { label: 'Take Attendance', icon: ClipboardCheck, view: 'attendance' as const, color: 'bg-emerald-100 text-emerald-700' },
  { label: 'Grade Exams', icon: FileEdit, view: 'results' as const, color: 'bg-blue-100 text-blue-700' },
  { label: 'Create Lesson Plan', icon: Sparkles, view: 'lesson-plans' as const, color: 'bg-purple-100 text-purple-700' },
  { label: 'AI Grading', icon: BarChart3, view: 'ai-grading' as const, color: 'bg-amber-100 text-amber-700' },
];

interface ApiClass {
  id: string;
  name: string;
  section: string | null;
  grade: string | null;
  _count: { students: number; subjects: number; exams: number };
}

interface ApiStudent {
  id: string;
  admissionNo: string;
  gpa: number | null;
  user: { name: string; email: string; avatar: string | null };
  class: { id: string; name: string; section: string | null; grade: string | null } | null;
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

export function TeacherDashboard() {
  const { currentUser, setCurrentView, selectedSchoolId } = useAppStore();
  const [activeTab, setActiveTab] = useState('schedule');
  const [classes, setClasses] = useState<ApiClass[]>([]);
  const [students, setStudents] = useState<ApiStudent[]>([]);
  const [announcements, setAnnouncements] = useState<ApiAnnouncement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const schoolId = currentUser.schoolId || selectedSchoolId || '';
        const params = new URLSearchParams();
        if (schoolId) params.set('schoolId', schoolId);
        params.set('limit', '50');

        const [classesRes, announcementsRes] = await Promise.all([
          fetch(`/api/classes?${params.toString()}`),
          fetch(`/api/announcements?${params.toString()}`),
        ]);

        if (!classesRes.ok) throw new Error('Failed to load classes');
        if (!announcementsRes.ok) throw new Error('Failed to load announcements');

        const classesJson = await classesRes.json();
        const announcementsJson = await announcementsRes.json();

        const classesData: ApiClass[] = classesJson.data || classesJson || [];
        const announcementsData: ApiAnnouncement[] = announcementsJson.data || announcementsJson || [];

        setClasses(classesData);
        setAnnouncements(announcementsData);

        // Fetch students for all classes
        if (classesData.length > 0) {
          const studentPromises = classesData.map((cls) =>
            fetch(`/api/students?schoolId=${schoolId}&classId=${cls.id}&limit=100`).then(r => {
              if (!r.ok) return { data: [] };
              return r.json();
            })
          );
          const studentResults = await Promise.all(studentPromises);
          const allStudents = studentResults.flatMap((r: { data?: ApiStudent[] }) => r.data || []);
          setStudents(allStudents);
        }
      } catch (err) {
        console.error(err);
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [currentUser.schoolId, selectedSchoolId]);

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const maxAverage = Math.max(...classPerformanceData.map(c => c.average));

  const totalPending = pendingGrading.reduce((a, g) => a + (g.students - g.submitted), 0);
  const totalSubmitted = pendingGrading.reduce((a, g) => a + g.submitted, 0);

  const classNames = classes.map(c => c.name);
  const totalStudents = students.length;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-40 mt-2" />
          </div>
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
        <div className="space-y-4">
          <Skeleton className="h-10 w-full max-w-md" />
          <div className="grid gap-4 lg:grid-cols-3">
            <Skeleton className="h-80 rounded-xl lg:col-span-2" />
            <Skeleton className="h-80 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Welcome back, {currentUser.name.split(' ')[0]} 👋</h1>
          <p className="text-muted-foreground">{today}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1 text-sm py-1">
            <BookOpen className="size-3.5" /> Mathematics Department
          </Badge>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <KpiCard title="My Classes" value={String(classes.length || classNames.length || 4)} icon={BookOpen} iconBgColor="bg-blue-100" iconColor="text-blue-600" changeLabel={classNames.length > 0 ? classNames.slice(0, 3).join(', ') : 'Loading...'} />
        <KpiCard title="My Students" value={String(totalStudents || 125)} icon={GraduationCap} iconBgColor="bg-emerald-100" iconColor="text-emerald-600" change={5} changeLabel="new this term" sparklineData={[108, 112, 115, 118, 120, 122, 125]} />
        <KpiCard title="Pending Grades" value={String(totalPending)} icon={FileEdit} iconBgColor="bg-amber-100" iconColor="text-amber-600" changeLabel="needs attention" />
        <KpiCard title="Avg Class Score" value="79%" icon={BarChart3} iconBgColor="bg-purple-100" iconColor="text-purple-600" change={4} changeLabel="vs last month" />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="schedule">Today&apos;s Schedule</TabsTrigger>
          <TabsTrigger value="grading">Grading</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
        </TabsList>

        {/* Schedule Tab */}
        <TabsContent value="schedule" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-3">
            {/* Today's Schedule */}
            <Card className="lg:col-span-2">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">Today&apos;s Schedule</CardTitle>
                    <CardDescription>5 periods scheduled</CardDescription>
                  </div>
                  <Badge variant="outline" className="text-xs">Mathematics</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {todaySchedule.map((period, i) => (
                    <div key={i} className={`flex items-center gap-3 rounded-lg border p-3 transition-colors ${
                      period.status === 'completed' ? 'bg-muted/30' :
                      period.status === 'in-progress' ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800' :
                      'hover:bg-muted/50'
                    }`}>
                      <div className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${
                        period.status === 'completed' ? 'bg-muted text-muted-foreground' :
                        period.status === 'in-progress' ? 'bg-emerald-100 text-emerald-600' :
                        'bg-primary/10 text-primary'
                      }`}>
                        {period.status === 'completed' ? <CheckCircle2 className="size-4" /> :
                         period.status === 'in-progress' ? <CircleDot className="size-4 animate-pulse" /> :
                         <Clock className="size-4" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium">{period.subject}</p>
                        <p className="text-xs text-muted-foreground">{period.class} · {period.room}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-xs text-muted-foreground whitespace-nowrap">{period.time}</span>
                        {period.status === 'in-progress' && (
                          <Badge className="text-[10px] mt-1 bg-emerald-100 text-emerald-700 hover:bg-emerald-100">Live</Badge>
                        )}
                        {period.status === 'completed' && (
                          <p className="text-[10px] text-muted-foreground mt-1">Done</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Student Performance Alerts */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Alerts</CardTitle>
                  <Badge variant="destructive" className="text-xs">{performanceAlerts.length}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="max-h-[340px]">
                  <div className="space-y-3">
                    {performanceAlerts.map((alert, i) => (
                      <div key={i} className="flex items-start gap-2.5 rounded-lg border p-2.5 hover:bg-muted/50 transition-colors">
                        <Avatar className="size-7 mt-0.5">
                          <AvatarFallback className="text-[10px]">{alert.avatar}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium">{alert.name}</p>
                          <p className="text-xs text-muted-foreground">{alert.class}</p>
                          <p className="text-xs mt-1">{alert.issue}</p>
                        </div>
                        <div className={`flex size-6 shrink-0 items-center justify-center rounded ${
                          alert.type === 'error' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'
                        }`}>
                          {alert.type === 'error' ? <XCircle className="size-3" /> : <AlertTriangle className="size-3" />}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Grading Tab */}
        <TabsContent value="grading" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            {/* Pending Grading Tasks */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Pending Grading</CardTitle>
                  <Badge variant="outline">{pendingGrading.length} tasks</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="max-h-[360px]">
                  <div className="space-y-3">
                    {pendingGrading.map((task, i) => (
                      <div key={i} className="rounded-lg border p-3 hover:bg-muted/50 transition-colors">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <p className="text-sm font-medium">{task.class} — {task.type}</p>
                            <p className="text-xs text-muted-foreground">{task.subject} · Due {task.dueDate}</p>
                          </div>
                          <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => setCurrentView('results')}>
                            Grade
                          </Button>
                        </div>
                        <div className="flex items-center gap-2">
                          <Progress value={(task.submitted / task.students) * 100} className="h-2 flex-1" />
                          <span className="text-xs text-muted-foreground whitespace-nowrap">{task.submitted}/{task.students}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Class Performance */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Class Performance Overview</CardTitle>
                <CardDescription>Average scores across classes this term</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {classPerformanceData.map(cls => (
                    <div key={cls.class} className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{cls.class}</span>
                          <span className="text-xs text-muted-foreground">({cls.students} students)</span>
                        </div>
                        <span className={`text-sm font-semibold ${cls.average >= 80 ? 'text-emerald-600' : cls.average >= 70 ? 'text-amber-600' : 'text-red-600'}`}>
                          {cls.average}%
                        </span>
                      </div>
                      <div className="h-3 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${cls.average >= 80 ? 'bg-emerald-500' : cls.average >= 70 ? 'bg-amber-500' : 'bg-red-500'}`}
                          style={{ width: `${cls.average}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Students Tab */}
        <TabsContent value="students" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">My Students Performance</CardTitle>
                <Button variant="ghost" size="sm" className="text-xs" onClick={() => setCurrentView('analytics')}>
                  <Eye className="size-3.5 mr-1" /> Detailed Analytics
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="max-h-[400px]">
                <div className="space-y-2">
                  {students.length > 0 ? students.map(student => (
                    <div key={student.id} className="flex items-center gap-3 rounded-lg border p-3 hover:bg-muted/50 transition-colors">
                      <Avatar className="size-9">
                        <AvatarFallback className="text-xs">{student.user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">{student.user.name}</p>
                        <p className="text-xs text-muted-foreground">{student.class?.name || 'Unassigned'} · {student.admissionNo}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold">{student.gpa || '—'} GPA</p>
                      </div>
                    </div>
                  )) : (
                    <p className="text-sm text-muted-foreground text-center py-8">No students found</p>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Actions + Recent Announcements */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {quickActions.map(action => (
                <Button key={action.label} variant="outline" className="h-auto flex-col gap-3 py-4 px-4 hover:bg-accent" onClick={() => setCurrentView(action.view)}>
                  <div className={`size-10 rounded-xl flex items-center justify-center ${action.color}`}>
                    <action.icon className="size-5" />
                  </div>
                  <span className="text-sm font-medium">{action.label}</span>
                  <ChevronRight className="size-4 text-muted-foreground" />
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Announcements</CardTitle>
              <Button variant="ghost" size="sm" className="text-xs" onClick={() => setCurrentView('announcements')}>All</Button>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="max-h-[160px]">
              <div className="space-y-2">
                {announcements.length > 0 ? announcements.slice(0, 3).map(ann => (
                  <div key={ann.id} className="flex items-start gap-2 p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => setCurrentView('announcements')}>
                    <div className={`mt-0.5 size-6 rounded flex items-center justify-center shrink-0 ${
                      ann.priority === 'urgent' ? 'bg-red-100 text-red-600' :
                      ann.priority === 'high' ? 'bg-amber-100 text-amber-600' :
                      'bg-blue-100 text-blue-600'
                    }`}>
                      <Megaphone className="size-3" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium truncate">{ann.title}</p>
                      <p className="text-[10px] text-muted-foreground">{(ann.publishedAt || ann.createdAt || '').split('T')[0]}</p>
                    </div>
                  </div>
                )) : (
                  <p className="text-xs text-muted-foreground text-center py-4">No announcements</p>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
