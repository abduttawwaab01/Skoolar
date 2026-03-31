'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSession, SessionProvider } from 'next-auth/react';
import { useAppStore } from '@/store/app-store';
import { AppShell } from '@/components/layout/app-shell';
import { LoginPage } from '@/components/auth/login-page';
import { RegisterPage } from '@/components/auth/register-page';
import { Toaster } from 'sonner';
import { RealtimeProvider } from '@/components/shared/realtime-provider';

// Super Admin
import { SuperAdminDashboard } from '@/components/dashboards/super-admin-dashboard';
import { SchoolsView } from '@/components/dashboards/schools-view';
import { RegistrationCodesView } from '@/components/dashboards/registration-codes-view';
import { AuditLogsView } from '@/components/dashboards/audit-logs-view';
import { SystemHealthView } from '@/components/dashboards/system-health-view';

// School Admin & Shared
import { SchoolAdminDashboard } from '@/components/dashboards/school-admin-dashboard';
import { StudentsView } from '@/components/dashboards/students-view';
import { TeachersView } from '@/components/dashboards/teachers-view';
import { ParentsView } from '@/components/dashboards/parents-view';
import { ClassesView } from '@/components/dashboards/classes-view';
import { SubjectsView } from '@/components/dashboards/subjects-view';
import { AttendanceView } from '@/components/dashboards/attendance-view';
import { ExamsView } from '@/components/dashboards/exams-view';
import { ResultsView } from '@/components/dashboards/results-view';
import { AnnouncementsView } from '@/components/dashboards/announcements-view';
import { CalendarView } from '@/components/dashboards/calendar-view';
import { FeedbackView } from '@/components/dashboards/feedback-view';
import { CommunicationView } from '@/components/dashboards/communication-view';
import { SchoolProfileView } from '@/components/dashboards/school-profile-view';
import { BrandingView } from '@/components/dashboards/branding-view';
import { SettingsView } from '@/components/dashboards/settings-view';
import { NotificationsView } from '@/components/dashboards/notifications-view';
import { AnalyticsView } from '@/components/dashboards/analytics-view';
import { BehaviorView } from '@/components/dashboards/behavior-view';
import { SubscriptionView } from '@/components/dashboards/subscription-view';
import { SchoolSettingsView } from '@/components/dashboards/school-settings-view';

// Teacher
import { TeacherDashboard } from '@/components/dashboards/teacher-dashboard';
import { TeacherAttendance } from '@/components/dashboards/teacher-attendance';
import { TeacherExams } from '@/components/dashboards/teacher-exams';
import { TeacherGrades } from '@/components/dashboards/teacher-grades';
import { TeacherLessonPlans } from '@/components/dashboards/teacher-lesson-plans';
import { TeacherAIAssistant } from '@/components/dashboards/teacher-ai-assistant';

// Student
import { StudentDashboard } from '@/components/dashboards/student-dashboard';
import { StudentResults } from '@/components/dashboards/student-results';
import { StudentExams } from '@/components/dashboards/student-exams';
import { StudentAchievements } from '@/components/dashboards/student-achievements';
import { StudentAnalytics } from '@/components/dashboards/student-analytics';
import { StudentAIChat } from '@/components/dashboards/student-ai-chat';

// Homework
import { TeacherHomework } from '@/components/dashboards/teacher-homework';
import { StudentHomework } from '@/components/dashboards/student-homework';
import { ParentHomework } from '@/components/dashboards/parent-homework';

// Video Lessons
import { VideoLessonsView } from '@/components/dashboards/video-lessons';
import { StudentVideoLessons } from '@/components/dashboards/student-video-lessons';

// Parent
import { ParentDashboard } from '@/components/dashboards/parent-dashboard';
import { ParentResults } from '@/components/dashboards/parent-results';
import { ParentFinance } from '@/components/dashboards/parent-finance';
import { ParentAttendance } from '@/components/dashboards/parent-attendance';

// Accountant
import { AccountantDashboard } from '@/components/dashboards/accountant-dashboard';
import { PaymentsView } from '@/components/dashboards/payments-view';
import { FeeStructureView } from '@/components/dashboards/fee-structure-view';

// Librarian
import { LibrarianDashboard } from '@/components/dashboards/librarian-dashboard';
import { BooksView } from '@/components/dashboards/books-view';
import { BorrowRecordsView } from '@/components/dashboards/borrow-records-view';
import { IdScannerView } from '@/components/dashboards/id-scanner-view';

// Director
import { DirectorDashboard } from '@/components/dashboards/director-dashboard';
import { ReportsView } from '@/components/dashboards/reports-view';

// User Management
import { UsersManagement } from '@/components/dashboards/users-management';

// Features
import { IDCardGenerator } from '@/components/features/id-card-generator';
import { ReportCardGenerator } from '@/components/features/report-card-generator';
import { ReportCardView } from '@/components/dashboards/report-card-view';
import AIGradingAssistant from '@/components/features/ai-grading-assistant';
import BulkOperations from '@/components/features/bulk-operations';
import AdvancedSearch from '@/components/features/advanced-search';
import MultiSchoolComparison from '@/components/features/multi-school-comparison';
import DataImportExport from '@/components/features/data-import-export';
import InAppChat from '@/components/features/in-app-chat';
import StudentPromotion from '@/components/features/student-promotion';
import SchoolCalendarEnhanced from '@/components/features/school-calendar';
import ParentPortalEnhanced from '@/components/features/parent-portal-enhanced';
import AdminAnalyticsAdvanced from '@/components/features/admin-analytics-advanced';
import NoticeBoard from '@/components/features/notice-board';
import StudentDiary from '@/components/features/student-diary';

// Additional
import { TransportView } from '@/components/dashboards/transport-view';
import { HealthRecordsView } from '@/components/dashboards/health-records-view';
import { SupportView } from '@/components/dashboards/support-view';

// Platform
import { PlatformAdminPanel } from '@/components/platform/platform-admin-panel';
import { Preloader } from '@/components/platform/preloader';

// Features
import { SchoolControlsPanel as SchoolControls } from '@/components/features/school-controls';
import { OverlayManagement } from '@/components/features/overlay-management';

// New Upgrades
import { ClassMonitoring } from '@/components/dashboards/class-monitoring';
import { MessagingCenter } from '@/components/dashboards/messaging-center';
import { PlansManager } from '@/components/dashboards/plans-manager';
import { DangerZone } from '@/components/dashboards/danger-zone';

import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

// Module-level component map (stable reference, not recreated during render)
const allComponents: Record<string, React.ComponentType> = {
  // Base views
  overview: SuperAdminDashboard,
  schools: SchoolsView,
  'registration-codes': RegistrationCodesView,
  analytics: AnalyticsView,
  'system-health': SystemHealthView,
  'audit-logs': AuditLogsView,
  notifications: NotificationsView,
  settings: SettingsView,
  'academic-structure': SchoolAdminDashboard,
  students: StudentsView,
  teachers: TeachersView,
  parents: ParentsView,
  classes: ClassesView,
  subjects: SubjectsView,
  attendance: AttendanceView,
  exams: ExamsView,
  results: ResultsView,
  'report-cards': ReportCardGenerator,
  'report-card-view': ReportCardView,
  finance: AccountantDashboard,
  payments: PaymentsView,
  'fee-structure': FeeStructureView,
  'id-cards': IDCardGenerator,
  'id-scanner': IdScannerView,
  announcements: AnnouncementsView,
  calendar: CalendarView,
  feedback: FeedbackView,
  communication: CommunicationView,
  'school-profile': SchoolProfileView,
  branding: BrandingView,
  'lesson-plans': TeacherLessonPlans,
  'ai-assistant': TeacherAIAssistant,
  achievements: StudentAchievements,
  library: LibrarianDashboard,
  books: BooksView,
  'borrow-records': BorrowRecordsView,
  reports: ReportsView,
  'health-records': HealthRecordsView,
  transport: TransportView,
  behavior: BehaviorView,
  subscription: SubscriptionView,
  'school-settings': SchoolSettingsView,

  // New Features
  'ai-grading': AIGradingAssistant,
  'bulk-operations': BulkOperations,
  'advanced-search': AdvancedSearch,
  'school-comparison': MultiSchoolComparison,
  'data-import': DataImportExport,
  'in-app-chat': InAppChat,
  'student-promotion': StudentPromotion,
  'school-calendar-enhanced': SchoolCalendarEnhanced,
  'parent-portal': ParentPortalEnhanced,
  'admin-analytics-advanced': AdminAnalyticsAdvanced,
  'notice-board': NoticeBoard,
  'student-diary': StudentDiary,
  'student-ai-chat': StudentAIChat,
  'teacher-homework': TeacherHomework,
  'homework': StudentHomework,
  'parent-homework': ParentHomework,
  'video-lessons': VideoLessonsView,
  'student-video-lessons': StudentVideoLessons,

  // Role-specific overrides
  'overview-SUPER_ADMIN': SuperAdminDashboard,
  'overview-SCHOOL_ADMIN': SchoolAdminDashboard,
  'overview-TEACHER': TeacherDashboard,
  'overview-STUDENT': StudentDashboard,
  'overview-PARENT': ParentDashboard,
  'overview-ACCOUNTANT': AccountantDashboard,
  'overview-LIBRARIAN': LibrarianDashboard,
  'overview-DIRECTOR': DirectorDashboard,
  'users-management': UsersManagement,

  // Role-specific view overrides
  'TEACHER-attendance': TeacherAttendance,
  'TEACHER-exams': TeacherExams,
  'TEACHER-results': TeacherGrades,
  'STUDENT-results': StudentResults,
  'STUDENT-exams': StudentExams,
  'STUDENT-analytics': StudentAnalytics,
  'PARENT-results': ParentResults,
  'PARENT-finance': ParentFinance,
  'PARENT-attendance': ParentAttendance,
  'PARENT-report-cards': ParentResults,
  'SCHOOL_ADMIN-report-cards': ReportCardView,
  'STUDENT-report-cards': ReportCardView,
  'TEACHER-homework': TeacherHomework,
  'STUDENT-homework': StudentHomework,
  'PARENT-homework': ParentHomework,
  'TEACHER-video-lessons': VideoLessonsView,
  'STUDENT-video-lessons': StudentVideoLessons,
  'SCHOOL_ADMIN-homework': TeacherHomework,
  'SCHOOL_ADMIN-video-lessons': VideoLessonsView,
  'SCHOOL_ADMIN-support': SupportView,
  'SCHOOL_ADMIN-subscription': SubscriptionView,
  'SCHOOL_ADMIN-school-settings': SchoolSettingsView,
  'SCHOOL_ADMIN-class-monitoring': ClassMonitoring,
  'SCHOOL_ADMIN-messaging-center': MessagingCenter,
  'TEACHER-class-monitoring': ClassMonitoring,
  'TEACHER-messaging-center': MessagingCenter,
  'STUDENT-messaging-center': MessagingCenter,
  'PARENT-messaging-center': MessagingCenter,
  'SCHOOL_ADMIN-plans-manager': PlansManager,
  support: SupportView,
  'platform-management': PlatformAdminPanel,
  'school-controls': SchoolControls,
  'overlay-management': OverlayManagement,
  'class-monitoring': ClassMonitoring,
  'messaging-center': MessagingCenter,
  'plans-manager': PlansManager,
  'danger-zone': DangerZone,
};

function AuthenticatedApp() {
  const { currentView, theme, currentRole } = useAppStore();
  const [preloaderDone, setPreloaderDone] = useState(false);

  // Apply theme
  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
  }, [theme]);

  // Check if preloader has been shown this session
  useEffect(() => {
    const hasShown = sessionStorage.getItem('skoolar-preloader-shown');
    if (hasShown) {
      setPreloaderDone(true);
    }
  }, []);

  const handlePreloaderComplete = useCallback(() => {
 setPreloaderDone(true);
    sessionStorage.setItem('skoolar-preloader-shown', 'true');
  }, []);

  // Resolve component key based on role and view
  const componentKey = currentView === 'overview'
    ? `overview-${currentRole}`
    : `${currentRole}-${currentView}`;

  const ActiveComponent = allComponents[componentKey] || allComponents[currentView] || SuperAdminDashboard;

  return (
    <>
      <Preloader onComplete={handlePreloaderComplete} show={!preloaderDone} />
      {preloaderDone && (
        <AppShell>
          <React.Suspense fallback={
            <div className="space-y-4">
              <Skeleton className="h-8 w-48" />
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-28 rounded-xl" />
                ))}
              </div>
              <Skeleton className="h-64 rounded-xl" />
              <Skeleton className="h-48 rounded-xl" />
            </div>
          }>
            <ActiveComponent />
          </React.Suspense>
        </AppShell>
      )}
    </>
  );
}

type AuthView = 'login' | 'register';

function AuthGate() {
  const { data: session, status } = useSession();
  const [authView, setAuthView] = useState<AuthView>('login');

  // Loading state
  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-teal-50">
        <div className="flex flex-col items-center gap-4">
          <div className="flex size-12 items-center justify-center rounded-xl bg-emerald-600 text-white animate-pulse">
            <svg className="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 14l9-5-9-5-9 5 9 5z" />
              <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
            </svg>
          </div>
          <p className="text-sm text-gray-500">Loading Skoolar...</p>
          <Loader2 className="size-5 text-emerald-600 animate-spin" />
        </div>
      </div>
    );
  }

  // Not authenticated - show login/register
  if (!session) {
    if (authView === 'register') {
      return <RegisterPage onSwitchToLogin={() => setAuthView('login')} />;
    }
    return <LoginPage onSwitchToRegister={() => setAuthView('register')} />;
  }

  // Authenticated - show dashboard
  return <AuthenticatedApp />;
}

export default function Home() {
  return (
    <SessionProvider>
      <RealtimeProvider>
        <AuthGate />
        <Toaster
          position="top-right"
          richColors
          closeButton
          toastOptions={{
            duration: 3500,
            classNames: {
              toast: 'group toast',
              title: 'toast-title font-semibold text-sm',
              description: 'toast-description text-xs',
            },
          }}
        />
      </RealtimeProvider>
    </SessionProvider>
  );
}
