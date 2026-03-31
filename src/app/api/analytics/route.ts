import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/analytics - Comprehensive analytics data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const schoolId = searchParams.get('schoolId') || '';
    const termId = searchParams.get('termId') || '';
    const classId = searchParams.get('classId') || '';

    if (!schoolId) {
      return NextResponse.json(
        { error: 'schoolId is required' },
        { status: 400 }
      );
    }

    const where: Record<string, unknown> = { schoolId };
    if (termId) where.termId = termId;

    // ==========================================
    // 1. School Overview
    // ==========================================
    const [
      totalStudents,
      totalTeachers,
      totalClasses,
      totalSubjects,
    ] = await Promise.all([
      db.student.count({ where: { schoolId, deletedAt: null, isActive: true } }),
      db.teacher.count({ where: { schoolId, deletedAt: null, isActive: true } }),
      db.class.count({ where: { schoolId, deletedAt: null } }),
      db.subject.count({ where: { schoolId, deletedAt: null } }),
    ]);

    const schoolOverview = {
      totalStudents,
      totalTeachers,
      totalClasses,
      totalSubjects,
      studentTeacherRatio: totalTeachers > 0 ? Math.round((totalStudents / totalTeachers) * 10) / 10 : 0,
    };

    // ==========================================
    // 2. Attendance Stats by Class
    // ==========================================
    const classes = await db.class.findMany({
      where: { schoolId, deletedAt: null },
      select: {
        id: true,
        name: true,
        section: true,
        grade: true,
        students: {
          where: { deletedAt: null, isActive: true },
          select: { id: true },
        },
      },
    });

    const attendanceByClass: Array<{
      classId: string;
      className: string;
      section: string | null;
      grade: string | null;
      totalStudents: number;
      totalRecords: number;
      presentCount: number;
      absentCount: number;
      lateCount: number;
      percentage: number;
    }> = [];

    for (const cls of classes) {
      const attendanceWhere: Record<string, unknown> = {
        classId: cls.id,
        schoolId,
      };
      if (termId) {
        attendanceWhere.termId = termId;
      }

      const records = await db.attendance.findMany({
        where: attendanceWhere,
        select: { status: true },
      });

      const presentCount = records.filter((r) => r.status === 'present').length;
      const absentCount = records.filter((r) => r.status === 'absent').length;
      const lateCount = records.filter((r) => r.status === 'late').length;

      attendanceByClass.push({
        classId: cls.id,
        className: cls.name,
        section: cls.section,
        grade: cls.grade,
        totalStudents: cls.students.length,
        totalRecords: records.length,
        presentCount,
        absentCount,
        lateCount,
        percentage: records.length > 0 ? Math.round((presentCount / records.length) * 100) : 0,
      });
    }

    // ==========================================
    // 3. Performance Stats by Class/Subject
    // ==========================================
    const examWhere: Record<string, unknown> = { schoolId };
    if (termId) examWhere.termId = termId;
    if (classId) examWhere.classId = classId;

    const exams = await db.exam.findMany({
      where: examWhere,
      select: {
        id: true,
        name: true,
        totalMarks: true,
        passingMarks: true,
        subjectId: true,
        classId: true,
        subject: { select: { name: true } },
        class: { select: { name: true, section: true } },
      },
    });

    const performanceBySubject: Array<{
      subjectId: string;
      subjectName: string;
      totalExams: number;
      averageScore: number;
      highestScore: number;
      lowestScore: number;
      passRate: number;
    }> = [];

    // Group exams by subject
    const subjectGroups = new Map<string, typeof exams>();
    for (const exam of exams) {
      const key = exam.subjectId;
      if (!subjectGroups.has(key)) {
        subjectGroups.set(key, []);
      }
      subjectGroups.get(key)!.push(exam);
    }

    for (const [subjectId, subjectExams] of subjectGroups) {
      const examIds = subjectExams.map((e) => e.id);
      const scores = await db.examScore.findMany({
        where: { examId: { in: examIds } },
        select: { score: true },
      });

      const scoreValues = scores.map((s) => s.score);
      const passingMarks = subjectExams[0]?.passingMarks || 50;

      performanceBySubject.push({
        subjectId,
        subjectName: subjectExams[0]?.subject.name || 'Unknown',
        totalExams: subjectExams.length,
        averageScore: scoreValues.length > 0
          ? Math.round((scoreValues.reduce((a, b) => a + b, 0) / scoreValues.length) * 100) / 100
          : 0,
        highestScore: scoreValues.length > 0 ? Math.max(...scoreValues) : 0,
        lowestScore: scoreValues.length > 0 ? Math.min(...scoreValues) : 0,
        passRate: scoreValues.length > 0
          ? Math.round((scores.filter((s) => s.score >= passingMarks).length / scoreValues.length) * 100)
          : 0,
      });
    }

    // ==========================================
    // 4. Financial Summary
    // ==========================================
    const financialSummary = await db.payment.aggregate({
      _sum: { amount: true },
      _count: true,
      where: { schoolId },
    });

    const paymentsByStatus = await db.payment.groupBy({
      by: ['status'],
      where: { schoolId },
      _sum: { amount: true },
      _count: true,
    });

    const financialData = {
      totalRevenue: financialSummary._sum.amount || 0,
      totalTransactions: financialSummary._count,
      byStatus: paymentsByStatus.map((p) => ({
        status: p.status,
        total: p._sum.amount || 0,
        count: p._count,
      })),
    };

    // ==========================================
    // 5. Student Ranking
    // ==========================================
    const effectiveClassId = classId || null;

    const studentQueryWhere: Record<string, unknown> = {
      schoolId,
      deletedAt: null,
      isActive: true,
    };
    if (effectiveClassId) studentQueryWhere.classId = effectiveClassId;

    const students = await db.student.findMany({
      where: studentQueryWhere,
      select: {
        id: true,
        admissionNo: true,
        userId: true,
        classId: true,
        gpa: true,
        cumulativeGpa: true,
        user: { select: { name: true, avatar: true } },
        class: { select: { name: true, section: true } },
      },
      orderBy: { gpa: 'desc' },
      take: 50,
    });

    // Get exam scores for each student for ranking
    const rankedStudents: Array<{
      id: string;
      admissionNo: string;
      userId: string;
      classId: string | null;
      gpa: number;
      cumulativeGpa: number;
      user: { name: string | null; avatar: string | null };
      class: { name: string; section: string | null } | null;
      totalScore: number;
      examCount: number;
    }> = [];
    for (const student of students) {
      const scoreWhere: Record<string, unknown> = { studentId: student.id };
      if (termId) {
        scoreWhere.exam = { termId };
      }

      const examScores = await db.examScore.findMany({
        where: scoreWhere,
        select: { score: true },
      });

      const totalScore = examScores.reduce((sum, s) => sum + s.score, 0);

      rankedStudents.push({
        ...student,
        totalScore,
        examCount: examScores.length,
      });
    }

    // Sort by total score
    rankedStudents.sort((a, b) => b.totalScore - a.totalScore);

    // ==========================================
    // 6. Attendance Trend (last 30 days)
    // ==========================================
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentAttendance = await db.attendance.findMany({
      where: {
        schoolId,
        date: { gte: thirtyDaysAgo },
      },
      select: { date: true, status: true },
    });

    // Group by date
    const attendanceTrend = new Map<string, { date: string; present: number; absent: number; late: number; total: number }>();
    for (const record of recentAttendance) {
      const dateKey = record.date.toISOString().split('T')[0];
      if (!attendanceTrend.has(dateKey)) {
        attendanceTrend.set(dateKey, { date: dateKey, present: 0, absent: 0, late: 0, total: 0 });
      }
      const dayData = attendanceTrend.get(dateKey)!;
      dayData.total++;
      if (record.status === 'present') dayData.present++;
      else if (record.status === 'absent') dayData.absent++;
      else if (record.status === 'late') dayData.late++;
    }

    return NextResponse.json({
      data: {
        schoolOverview,
        attendanceByClass,
        performanceBySubject,
        financialData,
        studentRanking: rankedStudents.map((s, i) => ({
          rank: i + 1,
          ...s,
        })),
        attendanceTrend: Array.from(attendanceTrend.values()).sort((a, b) => a.date.localeCompare(b.date)),
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
