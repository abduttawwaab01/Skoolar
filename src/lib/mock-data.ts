import { v4 as uuidv4 } from 'uuid';

// ==========================================
// SKOOLAR - Comprehensive Mock Data
// ==========================================

export const schools = [
  {
    id: 'school-1',
    name: 'Greenfield Academy',
    slug: 'greenfield-academy',
    logo: null,
    address: '12 Education Drive, Lagos',
    motto: 'Excellence in Learning',
    phone: '+234-801-234-5678',
    email: 'info@greenfieldacademy.com',
    website: 'www.greenfieldacademy.com',
    primaryColor: '#059669',
    secondaryColor: '#10B981',
    region: 'Southwest',
    plan: 'enterprise',
    isActive: true,
    maxStudents: 1000,
    maxTeachers: 100,
    studentCount: 847,
    teacherCount: 72,
    foundedDate: '2010-09-01',
  },
  {
    id: 'school-2',
    name: 'Sunrise International School',
    slug: 'sunrise-international',
    logo: null,
    address: '45 Knowledge Lane, Abuja',
    motto: 'Rising to Excellence',
    phone: '+234-802-345-6789',
    email: 'info@sunriseintlschool.com',
    website: 'www.sunriseintlschool.com',
    primaryColor: '#DC2626',
    secondaryColor: '#F59E0B',
    region: 'North Central',
    plan: 'pro',
    isActive: true,
    maxStudents: 600,
    maxTeachers: 60,
    studentCount: 523,
    teacherCount: 48,
    foundedDate: '2015-01-15',
  },
  {
    id: 'school-3',
    name: 'Pinnacle College',
    slug: 'pinnacle-college',
    logo: null,
    address: '78 Summit Road, Port Harcourt',
    motto: 'Reaching the Peak',
    phone: '+234-803-456-7890',
    email: 'info@pinnaclecollege.com',
    website: 'www.pinnaclecollege.com',
    primaryColor: '#7C3AED',
    secondaryColor: '#A78BFA',
    region: 'South-South',
    plan: 'basic',
    isActive: true,
    maxStudents: 400,
    maxTeachers: 40,
    studentCount: 312,
    teacherCount: 28,
    foundedDate: '2018-09-01',
  },
  {
    id: 'school-4',
    name: 'Heritage Grammar School',
    slug: 'heritage-grammar',
    logo: null,
    address: '23 Culture Street, Ibadan',
    motto: 'Building Tomorrow\'s Leaders',
    phone: '+234-804-567-8901',
    email: 'info@heritagegrammar.com',
    primaryColor: '#B45309',
    secondaryColor: '#D97706',
    region: 'Southwest',
    plan: 'basic',
    isActive: true,
    maxStudents: 300,
    maxTeachers: 30,
    studentCount: 198,
    teacherCount: 22,
    foundedDate: '2020-01-10',
  },
];

export const currentUser = {
  id: 'user-1',
  email: 'admin@skoolar.com',
  name: 'Odebunmi Tawwāb',
  role: 'SUPER_ADMIN' as const,
  schoolId: 'school-1',
  schoolName: 'Greenfield Academy',
  avatar: null,
  isActive: true,
};

export type UserRole = 'SUPER_ADMIN' | 'SCHOOL_ADMIN' | 'TEACHER' | 'STUDENT' | 'PARENT' | 'ACCOUNTANT' | 'LIBRARIAN' | 'DIRECTOR';

export const roleConfig: Record<UserRole, { label: string; color: string; icon: string }> = {
  SUPER_ADMIN: { label: 'Super Admin', color: '#DC2626', icon: 'shield' },
  SCHOOL_ADMIN: { label: 'School Admin', color: '#059669', icon: 'building' },
  TEACHER: { label: 'Teacher', color: '#2563EB', icon: 'book-open' },
  STUDENT: { label: 'Student', color: '#7C3AED', icon: 'graduation-cap' },
  PARENT: { label: 'Parent', color: '#D97706', icon: 'users' },
  ACCOUNTANT: { label: 'Accountant', color: '#0891B2', icon: 'calculator' },
  LIBRARIAN: { label: 'Librarian', color: '#4F46E5', icon: 'library' },
  DIRECTOR: { label: 'Director', color: '#BE185D', icon: 'target' },
};

export const students = [
  { id: 'stu-1', name: 'Adewale Johnson', admissionNo: 'GFA/2024/001', class: 'JSS 1A', gender: 'Male', gpa: 3.8, attendance: 96, feesPaid: true, behaviorScore: 95, photo: null },
  { id: 'stu-2', name: 'Fatima Bello', admissionNo: 'GFA/2024/002', class: 'JSS 1A', gender: 'Female', gpa: 4.2, attendance: 98, feesPaid: true, behaviorScore: 98, photo: null },
  { id: 'stu-3', name: 'Chinedu Okafor', admissionNo: 'GFA/2024/003', class: 'JSS 1B', gender: 'Male', gpa: 3.1, attendance: 88, feesPaid: false, behaviorScore: 82, photo: null },
  { id: 'stu-4', name: 'Amina Yusuf', admissionNo: 'GFA/2024/004', class: 'JSS 2A', gender: 'Female', gpa: 3.9, attendance: 94, feesPaid: true, behaviorScore: 90, photo: null },
  { id: 'stu-5', name: 'Tobi Adeyemi', admissionNo: 'GFA/2024/005', class: 'JSS 2A', gender: 'Male', gpa: 2.8, attendance: 82, feesPaid: true, behaviorScore: 75, photo: null },
  { id: 'stu-6', name: 'Grace Okonkwo', admissionNo: 'GFA/2024/006', class: 'JSS 2B', gender: 'Female', gpa: 4.5, attendance: 99, feesPaid: true, behaviorScore: 100, photo: null },
  { id: 'stu-7', name: 'Emeka Nwankwo', admissionNo: 'GFA/2024/007', class: 'SS 1A', gender: 'Male', gpa: 3.5, attendance: 91, feesPaid: false, behaviorScore: 88, photo: null },
  { id: 'stu-8', name: 'Zainab Aliyu', admissionNo: 'GFA/2024/008', class: 'SS 1A', gender: 'Female', gpa: 4.0, attendance: 95, feesPaid: true, behaviorScore: 93, photo: null },
  { id: 'stu-9', name: 'Samuel Adebanjo', admissionNo: 'GFA/2024/009', class: 'SS 2A', gender: 'Male', gpa: 3.3, attendance: 87, feesPaid: true, behaviorScore: 85, photo: null },
  { id: 'stu-10', name: 'Blessing Igwe', admissionNo: 'GFA/2024/010', class: 'SS 2B', gender: 'Female', gpa: 4.1, attendance: 97, feesPaid: true, behaviorScore: 96, photo: null },
  { id: 'stu-11', name: 'David Ogunlesi', admissionNo: 'GFA/2024/011', class: 'SS 3A', gender: 'Male', gpa: 3.7, attendance: 92, feesPaid: true, behaviorScore: 89, photo: null },
  { id: 'stu-12', name: 'Hauwa Ibrahim', admissionNo: 'GFA/2024/012', class: 'SS 3A', gender: 'Female', gpa: 4.3, attendance: 98, feesPaid: true, behaviorScore: 97, photo: null },
];

export const teachers = [
  { id: 'tch-1', name: 'Mrs. Adebayo Funke', subject: 'Mathematics', classes: ['JSS 1A', 'JSS 1B', 'JSS 2A'], students: 120, photo: null, qualification: 'B.Ed Mathematics', phone: '+234-801-111-1111' },
  { id: 'tch-2', name: 'Mr. Okoro Chukwuma', subject: 'English Language', classes: ['JSS 1A', 'JSS 2A', 'SS 1A'], students: 115, photo: null, qualification: 'B.A English', phone: '+234-801-222-2222' },
  { id: 'tch-3', name: 'Dr. Ishaq Mohammed', subject: 'Physics', classes: ['SS 1A', 'SS 2A', 'SS 3A'], students: 90, photo: null, qualification: 'Ph.D Physics', phone: '+234-801-333-3333' },
  { id: 'tch-4', name: 'Ms. Eze Peace', subject: 'Biology', classes: ['SS 1A', 'SS 2A', 'SS 3A'], students: 88, photo: null, qualification: 'B.Sc Biology', phone: '+234-801-444-4444' },
  { id: 'tch-5', name: 'Mr. Balogun Wasiu', subject: 'Chemistry', classes: ['SS 1A', 'SS 2A'], students: 62, photo: null, qualification: 'B.Sc Chemistry', phone: '+234-801-555-5555' },
  { id: 'tch-6', name: 'Mrs. Okeke Ngozi', subject: 'Christian Religious Studies', classes: ['JSS 1A', 'JSS 1B', 'JSS 2B'], students: 125, photo: null, qualification: 'B.Ed CRS', phone: '+234-801-666-6666' },
  { id: 'tch-7', name: 'Mr. Garba Abdul', subject: 'Computer Science', classes: ['JSS 2A', 'SS 1A', 'SS 2A'], students: 105, photo: null, qualification: 'B.Sc Computer Science', phone: '+234-801-777-7777' },
  { id: 'tch-8', name: 'Ms. Adesanya Bolanle', subject: 'Financial Accounting', classes: ['SS 1A', 'SS 2A', 'SS 3A'], students: 92, photo: null, qualification: 'B.Sc Accounting', phone: '+234-801-888-8888' },
];

export const subjects = ['Mathematics', 'English Language', 'Physics', 'Chemistry', 'Biology', 'Computer Science', 'Financial Accounting', 'Christian Religious Studies', 'Islamic Studies', 'Civic Education', 'Economics', 'Government', 'Geography', 'History', 'Literature in English', 'Agricultural Science', 'Physical Education', 'Fine Arts', 'Music', 'French'];

export const classes = ['JSS 1A', 'JSS 1B', 'JSS 2A', 'JSS 2B', 'SS 1A', 'SS 1B', 'SS 2A', 'SS 2B', 'SS 3A', 'SS 3B'];

export const academicYears = [
  { id: 'ay-1', name: '2024/2025', startDate: '2024-09-01', endDate: '2025-07-31', isCurrent: true, isLocked: false, terms: [
    { id: 'term-1', name: 'First Term', order: 1, startDate: '2024-09-01', endDate: '2024-12-19', isCurrent: false, isLocked: true },
    { id: 'term-2', name: 'Second Term', order: 2, startDate: '2025-01-07', endDate: '2025-03-28', isCurrent: true, isLocked: false },
    { id: 'term-3', name: 'Third Term', order: 3, startDate: '2025-04-21', endDate: '2025-07-31', isCurrent: false, isLocked: false },
  ]},
  { id: 'ay-2', name: '2023/2024', startDate: '2023-09-01', endDate: '2024-07-31', isCurrent: false, isLocked: true, terms: [
    { id: 'term-4', name: 'First Term', order: 1, startDate: '2023-09-01', endDate: '2023-12-19', isCurrent: false, isLocked: true },
    { id: 'term-5', name: 'Second Term', order: 2, startDate: '2024-01-07', endDate: '2024-03-28', isCurrent: false, isLocked: true },
    { id: 'term-6', name: 'Third Term', order: 3, startDate: '2024-04-21', endDate: '2024-07-31', isCurrent: false, isLocked: true },
  ]},
];

export const attendanceData = {
  today: { present: 712, absent: 98, late: 37, total: 847, rate: 88.4 },
  weekAverage: 89.2,
  monthAverage: 91.5,
  weekly: [
    { day: 'Mon', present: 780, absent: 67 },
    { day: 'Tue', present: 795, absent: 52 },
    { day: 'Wed', present: 770, absent: 77 },
    { day: 'Thu', present: 810, absent: 37 },
    { day: 'Fri', present: 760, absent: 87 },
  ],
  byClass: [
    { class: 'JSS 1A', rate: 95 },
    { class: 'JSS 1B', rate: 92 },
    { class: 'JSS 2A', rate: 88 },
    { class: 'JSS 2B', rate: 91 },
    { class: 'SS 1A', rate: 87 },
    { class: 'SS 1B', rate: 93 },
    { class: 'SS 2A', rate: 85 },
    { class: 'SS 2B', rate: 90 },
    { class: 'SS 3A', rate: 94 },
    { class: 'SS 3B', rate: 89 },
  ],
};

export const examResults = [
  { subject: 'Mathematics', score: 82, grade: 'A', classAvg: 71, highest: 98 },
  { subject: 'English Language', score: 75, grade: 'B', classAvg: 68, highest: 95 },
  { subject: 'Physics', score: 88, grade: 'A', classAvg: 62, highest: 97 },
  { subject: 'Chemistry', score: 71, grade: 'B', classAvg: 58, highest: 92 },
  { subject: 'Biology', score: 79, grade: 'B', classAvg: 65, highest: 94 },
  { subject: 'Computer Science', score: 91, grade: 'A', classAvg: 73, highest: 99 },
  { subject: 'Financial Accounting', score: 68, grade: 'C', classAvg: 60, highest: 88 },
  { subject: 'Civic Education', score: 85, grade: 'A', classAvg: 75, highest: 96 },
];

export const financialData = {
  totalRevenue: 45600000,
  totalPending: 12800000,
  totalCollected: 32800000,
  collectionRate: 71.9,
  monthlyTrend: [
    { month: 'Sep', amount: 12500000 },
    { month: 'Oct', amount: 8900000 },
    { month: 'Nov', amount: 7600000 },
    { month: 'Dec', amount: 5400000 },
    { month: 'Jan', amount: 6800000 },
    { month: 'Feb', amount: 7200000 },
    { month: 'Mar', amount: 5100000 },
  ],
  byFeeType: [
    { type: 'Tuition', amount: 28000000 },
    { type: 'Lab Fee', amount: 5200000 },
    { type: 'Sports Fee', amount: 3800000 },
    { type: 'Transport', amount: 4600000 },
    { type: 'Others', amount: 4000000 },
  ],
  recentPayments: [
    { id: 'pay-1', student: 'Adewale Johnson', amount: 150000, method: 'Bank Transfer', date: '2025-03-28', status: 'completed', term: 'Second Term' },
    { id: 'pay-2', student: 'Fatima Bello', amount: 150000, method: 'Card', date: '2025-03-27', status: 'completed', term: 'Second Term' },
    { id: 'pay-3', student: 'Emeka Nwankwo', amount: 75000, method: 'Cash', date: '2025-03-26', status: 'pending', term: 'Second Term' },
    { id: 'pay-4', student: 'Tobi Adeyemi', amount: 150000, method: 'Online', date: '2025-03-25', status: 'completed', term: 'Second Term' },
    { id: 'pay-5', student: 'Amina Yusuf', amount: 150000, method: 'Bank Transfer', date: '2025-03-24', status: 'completed', term: 'Second Term' },
  ],
};

export const libraryData = {
  totalBooks: 3450,
  availableBooks: 2890,
  borrowedBooks: 520,
  overdueBooks: 38,
  categories: [
    { name: 'Textbooks', count: 1200 },
    { name: 'Novels', count: 800 },
    { name: 'Science', count: 450 },
    { name: 'History', count: 350 },
    { name: 'Arts', count: 280 },
    { name: 'Reference', count: 200 },
    { name: 'Digital', count: 170 },
  ],
  recentBorrows: [
    { id: 'br-1', student: 'Adewale Johnson', book: 'Physics for Senior Secondary', borrowDate: '2025-03-20', dueDate: '2025-04-03', status: 'borrowed' },
    { id: 'br-2', student: 'Fatima Bello', book: 'Things Fall Apart', borrowDate: '2025-03-18', dueDate: '2025-04-01', status: 'overdue' },
    { id: 'br-3', student: 'Grace Okonkwo', book: 'Advanced Mathematics', borrowDate: '2025-03-25', dueDate: '2025-04-08', status: 'borrowed' },
    { id: 'br-4', student: 'Zainab Aliyu', book: 'Organic Chemistry', borrowDate: '2025-03-22', dueDate: '2025-04-05', status: 'borrowed' },
  ],
};

export const notifications = [
  { id: 'n-1', title: 'New Fee Payment', message: 'Fatima Bello\'s tuition fee for Second Term has been paid.', type: 'success', category: 'payment', isRead: false, time: '5 min ago' },
  { id: 'n-2', title: 'Exam Results Published', message: 'First Term results for JSS 1A are now available.', type: 'info', category: 'grade', isRead: false, time: '1 hour ago' },
  { id: 'n-3', title: 'Low Attendance Alert', message: 'Tobi Adeyemi has been absent 3 times this week.', type: 'warning', category: 'attendance', isRead: false, time: '2 hours ago' },
  { id: 'n-4', title: 'Overdue Library Books', message: '3 books are overdue for return this week.', type: 'warning', category: 'general', isRead: true, time: '3 hours ago' },
  { id: 'n-5', title: 'System Update', message: 'Platform maintenance scheduled for Saturday 2 AM.', type: 'info', category: 'system', isRead: true, time: '5 hours ago' },
  { id: 'n-6', title: 'Report Card Ready', message: 'Second Term mid-term reports are ready for review.', type: 'success', category: 'grade', isRead: false, time: '1 day ago' },
];

export const announcements = [
  { id: 'ann-1', title: 'Inter-House Sports Competition', content: 'The annual inter-house sports competition will hold on April 15, 2025. All students are expected to participate.', type: 'event', priority: 'high', date: '2025-03-28', author: 'School Admin' },
  { id: 'ann-2', title: 'Mid-Term Break Notice', content: 'School will be on mid-term break from March 31 to April 4, 2025. Classes resume on April 7.', type: 'general', priority: 'normal', date: '2025-03-25', author: 'School Admin' },
  { id: 'ann-3', title: 'Fee Payment Deadline', content: 'All outstanding fees for the second term must be paid by April 30, 2025 to avoid late charges.', type: 'urgent', priority: 'urgent', date: '2025-03-20', author: 'Bursar' },
  { id: 'ann-4', title: 'Parent-Teacher Conference', content: 'Parent-teacher conference is scheduled for April 12, 2025. Time: 10 AM - 3 PM.', type: 'event', priority: 'normal', date: '2025-03-18', author: 'School Admin' },
];

export const systemHealth = {
  uptime: 99.97,
  activeUsers: 342,
  apiRequests: 15420,
  avgResponseTime: 120,
  databaseSize: '2.4 GB',
  storageUsed: 78,
  queuedJobs: 12,
  websocketConnections: 189,
};

export const auditLogs = [
  { id: 'al-1', user: 'Odebunmi Tawwāb', action: 'update', entity: 'School', details: 'Updated school branding colors', time: '5 min ago', ip: '192.168.1.1' },
  { id: 'al-2', user: 'Mrs. Adebayo Funke', action: 'create', entity: 'Exam', details: 'Created JSS 1A Mathematics CA2', time: '15 min ago', ip: '192.168.1.45' },
  { id: 'al-3', user: 'System', action: 'export', entity: 'ReportCard', details: 'Exported 120 report cards for JSS 1A', time: '30 min ago', ip: '192.168.1.1' },
  { id: 'al-4', user: 'Mr. Garba Abdul', action: 'update', entity: 'ExamScore', details: 'Updated 35 exam scores for SS 1A', time: '1 hour ago', ip: '192.168.1.78' },
  { id: 'al-5', user: 'Odebunmi Tawwāb', action: 'create', entity: 'RegistrationCode', details: 'Generated 5 new registration codes', time: '2 hours ago', ip: '192.168.1.1' },
];

export const registrationCodes = [
  { id: 'rc-1', code: 'SKL-2025-A7X9', plan: 'enterprise', region: 'Southwest', maxUses: 1, usedCount: 1, expiresAt: '2025-12-31', isUsed: true, schoolName: 'Greenfield Academy' },
  { id: 'rc-2', code: 'SKL-2025-B3K2', plan: 'pro', region: 'North Central', maxUses: 1, usedCount: 1, expiresAt: '2025-12-31', isUsed: true, schoolName: 'Sunrise International School' },
  { id: 'rc-3', code: 'SKL-2025-C5M8', plan: 'basic', region: null, maxUses: 5, usedCount: 2, expiresAt: '2025-06-30', isUsed: false, schoolName: null },
  { id: 'rc-4', code: 'SKL-2025-D1N4', plan: 'pro', region: 'Southeast', maxUses: 1, usedCount: 0, expiresAt: '2025-09-30', isUsed: false, schoolName: null },
  { id: 'rc-5', code: 'SKL-2025-E6P7', plan: 'enterprise', region: null, maxUses: 10, usedCount: 0, expiresAt: '2026-01-31', isUsed: false, schoolName: null },
];

export const performanceTrends = [
  { month: 'Sep', avg: 65.2 },
  { month: 'Oct', avg: 68.1 },
  { month: 'Nov', avg: 71.5 },
  { month: 'Dec', avg: 70.3 },
  { month: 'Jan', avg: 73.8 },
  { month: 'Feb', avg: 75.2 },
  { month: 'Mar', avg: 77.6 },
];

export const topPerformers = [
  { rank: 1, name: 'Grace Okonkwo', class: 'JSS 2B', gpa: 4.5, trend: 'up' },
  { rank: 2, name: 'Hauwa Ibrahim', class: 'SS 3A', gpa: 4.3, trend: 'up' },
  { rank: 3, name: 'Fatima Bello', class: 'JSS 1A', gpa: 4.2, trend: 'stable' },
  { rank: 4, name: 'Blessing Igwe', class: 'SS 2B', gpa: 4.1, trend: 'up' },
  { rank: 5, name: 'Zainab Aliyu', class: 'SS 1A', gpa: 4.0, trend: 'down' },
];

export const feedbackData = [
  { id: 'fb-1', category: 'Academic', rating: 4, title: 'Need more practical labs', description: 'We need more hands-on science experiments', status: 'open', date: '2025-03-28', author: 'Parent' },
  { id: 'fb-2', category: 'Facility', rating: 3, title: 'Library needs renovation', description: 'The library space is too small for the student population', status: 'reviewed', date: '2025-03-25', author: 'Teacher' },
  { id: 'fb-3', category: 'Staff', rating: 5, title: 'Excellent teaching staff', description: 'The teachers are very dedicated and caring', status: 'resolved', date: '2025-03-20', author: 'Parent' },
];

export const mockUsers = [
  { id: 'user-1', name: 'Odebunmi Tawwāb', email: 'admin@skoolar.com', role: 'SUPER_ADMIN' as UserRole, schoolId: null, schoolName: null, isActive: true, lastLogin: '2025-03-28 14:30', createdAt: '2024-01-15', avatar: null },
  { id: 'user-2', name: 'Alhaja Fatimah Bakare', email: 'admin@greenfieldacademy.com', role: 'SCHOOL_ADMIN' as UserRole, schoolId: 'school-1', schoolName: 'Greenfield Academy', isActive: true, lastLogin: '2025-03-28 09:15', createdAt: '2024-03-10', avatar: null },
  { id: 'user-3', name: 'Mrs. Adebayo Funke', email: 'adebayo@greenfieldacademy.com', role: 'TEACHER' as UserRole, schoolId: 'school-1', schoolName: 'Greenfield Academy', isActive: true, lastLogin: '2025-03-28 08:00', createdAt: '2024-03-15', avatar: null },
  { id: 'user-4', name: 'Adewale Johnson', email: 'adewale@greenfieldacademy.com', role: 'STUDENT' as UserRole, schoolId: 'school-1', schoolName: 'Greenfield Academy', isActive: true, lastLogin: '2025-03-27 16:45', createdAt: '2024-09-05', avatar: null },
  { id: 'user-5', name: 'Mr. Johnson Adewale', email: 'johnson.parent@email.com', role: 'PARENT' as UserRole, schoolId: 'school-1', schoolName: 'Greenfield Academy', isActive: true, lastLogin: '2025-03-26 19:00', createdAt: '2024-09-05', avatar: null },
  { id: 'user-6', name: 'Alhaji Musa Accountant', email: 'accounts@greenfieldacademy.com', role: 'ACCOUNTANT' as UserRole, schoolId: 'school-1', schoolName: 'Greenfield Academy', isActive: true, lastLogin: '2025-03-28 10:30', createdAt: '2024-04-01', avatar: null },
  { id: 'user-7', name: 'Ms. Amina Librarian', email: 'library@greenfieldacademy.com', role: 'LIBRARIAN' as UserRole, schoolId: 'school-1', schoolName: 'Greenfield Academy', isActive: true, lastLogin: '2025-03-27 11:00', createdAt: '2024-04-10', avatar: null },
  { id: 'user-8', name: 'Prof. Ogunleye Director', email: 'director@greenfieldacademy.com', role: 'DIRECTOR' as UserRole, schoolId: 'school-1', schoolName: 'Greenfield Academy', isActive: true, lastLogin: '2025-03-25 14:00', createdAt: '2024-01-20', avatar: null },
  { id: 'user-9', name: 'Mr. Okoro Chukwuma', email: 'okoro@greenfieldacademy.com', role: 'TEACHER' as UserRole, schoolId: 'school-1', schoolName: 'Greenfield Academy', isActive: true, lastLogin: '2025-03-28 07:45', createdAt: '2024-03-20', avatar: null },
  { id: 'user-10', name: 'Dr. Ishaq Mohammed', email: 'ishaq@greenfieldacademy.com', role: 'TEACHER' as UserRole, schoolId: 'school-1', schoolName: 'Greenfield Academy', isActive: false, lastLogin: '2025-03-15 09:00', createdAt: '2024-03-22', avatar: null },
  { id: 'user-11', name: 'Chief Bello Admin', email: 'admin@sunriseintlschool.com', role: 'SCHOOL_ADMIN' as UserRole, schoolId: 'school-2', schoolName: 'Sunrise International School', isActive: true, lastLogin: '2025-03-28 08:30', createdAt: '2024-06-01', avatar: null },
  { id: 'user-12', name: 'Ms. Eze Peace', email: 'eze@greenfieldacademy.com', role: 'TEACHER' as UserRole, schoolId: 'school-1', schoolName: 'Greenfield Academy', isActive: true, lastLogin: '2025-03-28 08:10', createdAt: '2024-03-25', avatar: null },
  { id: 'user-13', name: 'Fatima Bello', email: 'fatima@greenfieldacademy.com', role: 'STUDENT' as UserRole, schoolId: 'school-1', schoolName: 'Greenfield Academy', isActive: true, lastLogin: '2025-03-28 07:55', createdAt: '2024-09-05', avatar: null },
  { id: 'user-14', name: 'Chinedu Okafor', email: 'chinedu@greenfieldacademy.com', role: 'STUDENT' as UserRole, schoolId: 'school-1', schoolName: 'Greenfield Academy', isActive: false, lastLogin: '2025-03-10 15:30', createdAt: '2024-09-05', avatar: null },
  { id: 'user-15', name: 'Mrs. Halima Principal', email: 'admin@pinnaclecollege.com', role: 'SCHOOL_ADMIN' as UserRole, schoolId: 'school-3', schoolName: 'Pinnacle College', isActive: true, lastLogin: '2025-03-28 09:00', createdAt: '2024-09-01', avatar: null },
];

export const calendarEvents = [
  { id: 'ev-1', title: 'Inter-House Sports', date: '2025-04-15', type: 'sports', color: '#059669' },
  { id: 'ev-2', title: 'Mid-Term Break', date: '2025-03-31', type: 'holiday', color: '#DC2626', endDate: '2025-04-04' },
  { id: 'ev-3', title: 'PTA Meeting', date: '2025-04-12', type: 'meeting', color: '#7C3AED' },
  { id: 'ev-4', title: 'Second Term Exams', date: '2025-06-15', type: 'exam', color: '#D97706' },
  { id: 'ev-5', title: 'Science Fair', date: '2025-05-20', type: 'academic', color: '#0891B2' },
  { id: 'ev-6', title: 'Graduation Ceremony', date: '2025-07-18', type: 'academic', color: '#BE185D' },
];
