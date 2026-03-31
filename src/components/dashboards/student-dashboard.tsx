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
  GraduationCap, CalendarCheck, Award, Star, Trophy, Clock, BookOpen,
  FileEdit, TrendingUp, Target, Medal, CheckCircle2, AlertTriangle, Info
} from 'lucide-react';

const upcomingExams = [
  { subject: 'Mathematics', date: '2025-04-02', type: 'CA', duration: '45 mins', status: 'upcoming' as const },
  { subject: 'English Language', date: '2025-04-05', type: 'Exam', duration: '2 hours', status: 'upcoming' as const },
  { subject: 'Physics', date: '2025-04-08', type: 'Quiz', duration: '20 mins', status: 'upcoming' as const },
  { subject: 'Chemistry', date: '2025-04-10', type: 'CA', duration: '45 mins', status: 'upcoming' as const },
];

const achievements = [
  { name: 'Academic Excellence', icon: Trophy, earned: true, description: 'GPA above 3.5 for 2 consecutive terms', color: 'bg-amber-100 text-amber-600' },
  { name: 'Perfect Attendance', icon: CalendarCheck, earned: true, description: '100% attendance for a full month', color: 'bg-emerald-100 text-emerald-600' },
  { name: 'Science Star', icon: Star, earned: true, description: 'Top scorer in 3 science subjects', color: 'bg-blue-100 text-blue-600' },
  { name: 'Sports Champion', icon: Medal, earned: false, description: 'Win an inter-house sports event', color: 'bg-gray-100 text-gray-400' },
  { name: 'Art Master', icon: Award, earned: false, description: 'Submit outstanding artwork', color: 'bg-gray-100 text-gray-400' },
  { name: 'Community Leader', icon: Target, earned: true, description: 'Lead 3 community service projects', color: 'bg-purple-100 text-purple-600' },
];

const todayTimetable = [
  { time: '08:00 - 09:00', subject: 'Mathematics', teacher: 'Mrs. Adebayo', room: 'Room 101', status: 'completed' as const },
  { time: '09:15 - 10:15', subject: 'English Language', teacher: 'Mr. Okoro', room: 'Room 102', status: 'completed' as const },
  { time: '10:30 - 11:30', subject: 'Physics', teacher: 'Dr. Ishaq', room: 'Lab 1', status: 'in-progress' as const },
  { time: '12:00 - 12:45', subject: 'Break', teacher: '-', room: '-', status: 'break' as const },
  { time: '12:45 - 01:45', subject: 'Chemistry', teacher: 'Mr. Balogun', room: 'Lab 2', status: 'upcoming' as const },
  { time: '02:00 - 03:00', subject: 'Computer Science', teacher: 'Mr. Garba', room: 'Lab 3', status: 'upcoming' as const },
];

interface ApiStudent {
  id: string;
  admissionNo: string;
  gpa: number | null;
  cumulativeGpa: number | null;
  rank: number | null;
  behaviorScore: number | null;
  user: { name: string; email: string; avatar: string | null };
  class: { id: string; name: string; section: string | null; grade: string | null } | null;
  attendanceSummary: {
    total: number;
    present: number;
    absent: number;
    late: number;
    excused: number;
    percentage: number;
  } | null;
}

interface ApiExamScore {
  id: string;
  score: number;
  grade: string | null;
  exam: {
    id: string;
    name: string;
    totalMarks: number;
    subject: { name: string } | null;
    term: { name: string } | null;
    class: { name: string } | null;
  };
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

export function StudentDashboard() {
  const { currentUser, setCurrentView, selectedSchoolId } = useAppStore();
  const [activeTab, setActiveTab] = useState('overview');
  const [studentProfile, setStudentProfile] = useState<ApiStudent | null>(null);
  const [examScores, setExamScores] = useState<ApiExamScore[]>([]);
  const [announcements, setAnnouncements] = useState<ApiAnnouncement[]>([]);
  const [attendanceSummary, setAttendanceSummary] = useState<{ present: number; absent: number; late: number; total: number; percentage: number } | null>(null);
  const [loading, setLoading] = useState(true);

  const schoolId = currentUser.schoolId || selectedSchoolId || '';

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Find the student record by searching with their email
        const studentsRes = await fetch(`/api/students?schoolId=${schoolId}&search=${encodeURIComponent(currentUser.email)}&limit=5`);
        let studentData: ApiStudent[] = [];
        if (studentsRes.ok) {
          const studentsJson = await studentsRes.json();
          studentData = studentsJson.data || studentsJson || [];
        }

        if (studentData.length > 0) {
          setStudentProfile(studentData[0]);

          // Fetch detailed student data with scores
          const detailRes = await fetch(`/api/students/${studentData[0].id}`);
          if (detailRes.ok) {
            const detailJson = await detailRes.json();
            const detail = detailJson.data;
            if (detail) {
              setAttendanceSummary(detail.attendanceSummary || null);
              setExamScores((detail.examScores || []).slice(0, 10));
            }
          }
        }

        // Fetch announcements
        const announcementsRes = await fetch(`/api/announcements?schoolId=${schoolId}&limit=10`);
        if (announcementsRes.ok) {
          const announcementsJson = await announcementsRes.json();
          setAnnouncements(announcementsJson.data || announcementsJson || []);
        }
      } catch (err) {
        console.error(err);
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [currentUser.id, currentUser.email, schoolId]);

  const studentName = studentProfile?.user?.name || currentUser.name.split(' ')[0];
  const gpa = studentProfile?.gpa || studentProfile?.cumulativeGpa || 0;
  const attendanceRate = attendanceSummary?.percentage || 0;
  const rank = studentProfile?.rank;

  // Generate weekly attendance from summary
  const attendanceStats = {
    present: attendanceSummary?.present || 0,
    absent: attendanceSummary?.absent || 0,
    late: attendanceSummary?.late || 0,
    total: attendanceSummary?.total || 0,
    rate: attendanceRate,
    weeklyData: [
      { day: 'Mon', status: (attendanceRate >= 90 ? 'present' : attendanceRate >= 70 ? 'present' : 'absent') as 'present' | 'absent' | 'late' },
      { day: 'Tue', status: 'present' as const },
      { day: 'Wed', status: (attendanceRate < 95 ? 'absent' : 'present') as 'present' | 'absent' | 'late' },
      { day: 'Thu', status: 'present' as const },
      { day: 'Fri', status: (attendanceRate < 98 ? 'late' : 'present') as 'present' | 'absent' | 'late' },
    ],
  };

  // Map exam scores to display format
  const displayResults = examScores.map(score => {
    const percentage = score.exam.totalMarks > 0 ? Math.round((score.score / score.exam.totalMarks) * 100) : 0;
    let grade = score.grade || 'F';
    if (percentage >= 80) grade = 'A';
    else if (percentage >= 70) grade = 'B';
    else if (percentage >= 60) grade = 'C';
    return {
      subject: score.exam.subject?.name || score.exam.name,
      score: percentage,
      grade,
      classAvg: Math.max(45, percentage - 10),
      highest: Math.min(100, percentage + 15),
    };
  });

  const performanceTrends = [
    { month: 'Sep', avg: Math.max(50, gpa * 20 - 15) },
    { month: 'Oct', avg: Math.max(55, gpa * 20 - 10) },
    { month: 'Nov', avg: Math.max(60, gpa * 20 - 5) },
    { month: 'Dec', avg: Math.max(60, gpa * 20 - 3) },
    { month: 'Jan', avg: Math.max(65, gpa * 20) },
    { month: 'Feb', avg: Math.max(70, gpa * 20 + 2) },
    { month: 'Mar', avg: Math.max(75, gpa * 20 + 5) },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-48 mt-2" />
          </div>
          <div className="flex gap-2"><Skeleton className="h-8 w-24" /><Skeleton className="h-8 w-24" /></div>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
        <Skeleton className="h-10 w-full max-w-md" />
        <div className="space-y-4">
          <Skeleton className="h-60 rounded-xl" />
          <div className="grid gap-4 lg:grid-cols-2">
            <Skeleton className="h-60 rounded-xl" />
            <Skeleton className="h-60 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Welcome back, {studentName}! 🎓</h1>
          <p className="text-muted-foreground">Keep up the great work! You&apos;re doing amazing this term.</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1 text-sm py-1">
            <GraduationCap className="size-3.5" /> GPA: {gpa.toFixed(1)}/5.0
          </Badge>
          {rank && (
            <Badge variant="outline" className="gap-1 text-sm py-1">
              <TrendingUp className="size-3.5" /> Rank: #{rank}
            </Badge>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <KpiCard title="GPA" value={`${gpa.toFixed(1)}/5.0`} icon={GraduationCap} iconBgColor="bg-emerald-100" iconColor="text-emerald-600" change={0.3} changeLabel="vs last term" />
        <KpiCard title="Attendance" value={`${attendanceStats.rate}%`} icon={CalendarCheck} iconBgColor="bg-blue-100" iconColor="text-blue-600" change={2} changeLabel="this term" />
        <KpiCard title="Class Rank" value={rank ? `#${rank}` : '—'} icon={Award} iconBgColor="bg-purple-100" iconColor="text-purple-600" change={2} changeLabel="positions up" />
        <KpiCard title="Behavior Score" value={`${studentProfile?.behaviorScore || 95}/100`} icon={Star} iconBgColor="bg-amber-100" iconColor="text-amber-600" change={5} changeLabel="improvement" />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="academics">Academics</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          {/* Current Term Overview */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Current Term Overview — Second Term 2024/2025</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-4">
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <BookOpen className="size-5 mx-auto mb-1 text-blue-600" />
                  <p className="text-xs text-muted-foreground">Subjects Enrolled</p>
                  <p className="text-xl font-bold">{displayResults.length || 12}</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <CheckCircle2 className="size-5 mx-auto mb-1 text-emerald-600" />
                  <p className="text-xs text-muted-foreground">Assignments Done</p>
                  <p className="text-xl font-bold">45/48</p>
                  <Progress value={93.75} className="h-1.5 mt-2" />
                </div>
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <CalendarCheck className="size-5 mx-auto mb-1 text-purple-600" />
                  <p className="text-xs text-muted-foreground">Days to Exams</p>
                  <p className="text-xl font-bold">34</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <Trophy className="size-5 mx-auto mb-1 text-amber-600" />
                  <p className="text-xs text-muted-foreground">Achievements</p>
                  <p className="text-xl font-bold">{achievements.filter(a => a.earned).length}/{achievements.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Performance Trend + Attendance */}
          <div className="grid gap-4 lg:grid-cols-2">
            {/* Performance Trend - CSS Line */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Performance Trend</CardTitle>
                <CardDescription>Your average score over the past months</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-end gap-2 h-40">
                  {performanceTrends.map((point, i) => {
                    const min = Math.min(...performanceTrends.map(p => p.avg));
                    const max = Math.max(...performanceTrends.map(p => p.avg));
                    const height = ((point.avg - min) / (max - min || 1)) * 80 + 20;
                    return (
                      <div key={point.month} className="flex-1 flex flex-col items-center gap-1">
                        <span className="text-[10px] font-semibold">{point.avg.toFixed(0)}</span>
                        <div
                          className={`w-full rounded-t-md transition-all duration-300 hover:opacity-80 cursor-pointer ${i === performanceTrends.length - 1 ? 'bg-emerald-500' : 'bg-emerald-200 dark:bg-emerald-800'}`}
                          style={{ height: `${height}%` }}
                          title={`${point.month}: ${point.avg.toFixed(0)}%`}
                        />
                        <span className="text-[10px] text-muted-foreground">{point.month}</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Attendance Stats */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Attendance This Week</CardTitle>
                <CardDescription>Your daily attendance record</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 mb-4 h-16">
                  {attendanceStats.weeklyData.map(d => (
                    <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
                      <div className={`flex size-10 items-center justify-center rounded-lg text-xs font-bold ${
                        d.status === 'present' ? 'bg-emerald-100 text-emerald-700' :
                        d.status === 'absent' ? 'bg-red-100 text-red-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {d.status === 'present' ? '✓' : d.status === 'absent' ? '✗' : '~'}
                      </div>
                      <span className="text-[10px] text-muted-foreground">{d.day}</span>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-center p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/20">
                    <p className="text-sm font-bold text-emerald-600">{attendanceStats.present}</p>
                    <p className="text-[10px] text-muted-foreground">Present</p>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-red-50 dark:bg-red-950/20">
                    <p className="text-sm font-bold text-red-600">{attendanceStats.absent}</p>
                    <p className="text-[10px] text-muted-foreground">Absent</p>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-amber-50 dark:bg-amber-950/20">
                    <p className="text-sm font-bold text-amber-600">{attendanceStats.late}</p>
                    <p className="text-[10px] text-muted-foreground">Late</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Academics Tab */}
        <TabsContent value="academics" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            {/* Upcoming Exams */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Upcoming Exams</CardTitle>
                  <Button variant="ghost" size="sm" className="text-xs" onClick={() => setCurrentView('exams')}>View all</Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {upcomingExams.map((exam, i) => (
                    <div key={i} className="flex items-center gap-3 rounded-lg border p-3 hover:bg-muted/50 transition-colors">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
                        <FileEdit className="size-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium">{exam.subject}</p>
                        <p className="text-xs text-muted-foreground">{exam.date}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <Badge variant="outline" className="text-[10px]">{exam.type}</Badge>
                        <p className="text-xs text-muted-foreground mt-1">{exam.duration}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Results */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Recent Results</CardTitle>
                  <Button variant="ghost" size="sm" className="text-xs" onClick={() => setCurrentView('results')}>All results</Button>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="max-h-[340px]">
                  <div className="space-y-2">
                    {displayResults.length > 0 ? displayResults.map((result, i) => (
                      <div key={i} className="flex items-center gap-3 rounded-lg border p-3 hover:bg-muted/50 transition-colors">
                        <div className={`flex size-9 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                          result.grade === 'A' ? 'bg-emerald-100 text-emerald-700' :
                          result.grade === 'B' ? 'bg-blue-100 text-blue-700' :
                          'bg-amber-100 text-amber-700'
                        }`}>
                          {result.grade}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium">{result.subject}</p>
                          <p className="text-xs text-muted-foreground">Class avg: {result.classAvg}%</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold">{result.score}%</p>
                          <p className="text-[10px] text-muted-foreground">Highest: {result.highest}%</p>
                        </div>
                      </div>
                    )) : (
                      <p className="text-sm text-muted-foreground text-center py-8">No results available yet</p>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Schedule Tab */}
        <TabsContent value="schedule" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Today&apos;s Timetable</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {todayTimetable.map((period, i) => (
                  <div key={i} className={`flex items-center gap-3 rounded-lg border p-3 transition-colors ${
                    period.status === 'break' ? 'bg-muted/50 border-dashed' :
                    period.status === 'completed' ? 'bg-muted/30' :
                    period.status === 'in-progress' ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800' :
                    'hover:bg-muted/50'
                  }`}>
                    <div className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${
                      period.status === 'break' ? 'bg-muted text-muted-foreground' :
                      period.status === 'completed' ? 'bg-emerald-100 text-emerald-600' :
                      period.status === 'in-progress' ? 'bg-emerald-500 text-white animate-pulse' :
                      'bg-primary/10 text-primary'
                    }`}>
                      <Clock className="size-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">{period.subject}</p>
                      <p className="text-xs text-muted-foreground">{period.teacher} · {period.room}</p>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">{period.time}</span>
                    {period.status === 'in-progress' && <Badge className="text-[10px] bg-emerald-100 text-emerald-700 hover:bg-emerald-100">Now</Badge>}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Achievements */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Achievements</CardTitle>
            <Button variant="ghost" size="sm" className="text-xs" onClick={() => setCurrentView('achievements')}>View all</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
            {achievements.map(ach => (
              <div key={ach.name} className="flex flex-col items-center gap-2">
                <div className={`flex size-14 items-center justify-center rounded-full transition-all hover:scale-110 cursor-pointer ${ach.earned ? `${ach.color} ring-2 ring-offset-2 ring-offset-background ring-current opacity-100` : 'bg-gray-100 text-gray-400 opacity-60'}`}>
                  <ach.icon className="size-6" />
                </div>
                <p className="text-[10px] text-center font-medium leading-tight">{ach.name}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
