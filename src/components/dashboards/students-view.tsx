'use client';

import * as React from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/shared/data-table';
import { StatusBadge } from '@/components/shared/status-badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Plus, User, GraduationCap, BookOpen, BarChart3, CalendarCheck, Loader2 } from 'lucide-react';
import { useAppStore } from '@/store/app-store';
import { toast } from 'sonner';

interface StudentRecord {
  id: string;
  admissionNo: string;
  name: string;
  className: string;
  gender: string | null;
  gpa: number | null;
  behaviorScore: number | null;
  email: string | null;
  phone: string | null;
  classId: string | null;
  isActive: boolean;
}

interface ClassRecord {
  id: string;
  name: string;
}

const columns: ColumnDef<StudentRecord>[] = [
  {
    accessorKey: 'admissionNo',
    header: 'Admission No',
    cell: ({ row }) => (
      <span className="text-xs font-mono">{row.original.admissionNo}</span>
    ),
  },
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ row }) => <span className="text-sm font-medium">{row.original.name}</span>,
  },
  {
    accessorKey: 'className',
    header: 'Class',
    cell: ({ row }) => (
      <Badge variant="outline" className="text-xs">{row.original.className || 'Unassigned'}</Badge>
    ),
  },
  {
    accessorKey: 'gender',
    header: 'Gender',
    cell: ({ row }) => <span className="text-sm">{row.original.gender || '—'}</span>,
  },
  {
    accessorKey: 'gpa',
    header: 'GPA',
    cell: ({ row }) => (
      <span className={row.original.gpa != null && row.original.gpa >= 4.0 ? 'text-emerald-600 font-semibold' : 'text-sm'}>
        {row.original.gpa != null ? row.original.gpa.toFixed(1) : '—'}
      </span>
    ),
  },
  {
    accessorKey: 'behaviorScore',
    header: 'Behavior',
    cell: ({ row }) => (
      <span className="text-sm">{row.original.behaviorScore != null ? `${row.original.behaviorScore}/100` : '—'}</span>
    ),
  },
  {
    accessorKey: 'isActive',
    header: 'Status',
    cell: ({ row }) => (
      <StatusBadge variant={row.original.isActive ? 'success' : 'warning'} size="sm">
        {row.original.isActive ? 'Active' : 'Inactive'}
      </StatusBadge>
    ),
  },
];

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-6 w-24 mb-2" />
          <Skeleton className="h-4 w-40" />
        </div>
        <Skeleton className="h-10 w-[150px]" />
      </div>
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    </div>
  );
}

export function StudentsView() {
  const { selectedSchoolId } = useAppStore();
  const [students, setStudents] = React.useState<StudentRecord[]>([]);
  const [classes, setClasses] = React.useState<ClassRecord[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [classFilter, setClassFilter] = React.useState('all');
  const [addOpen, setAddOpen] = React.useState(false);
  const [detailStudent, setDetailStudent] = React.useState<StudentRecord | null>(null);
  const [adding, setAdding] = React.useState(false);

  React.useEffect(() => {
    if (!selectedSchoolId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    Promise.all([
      fetch(`/api/students?schoolId=${selectedSchoolId}&limit=100`)
        .then(res => res.json())
        .then(json => {
          const items = json.data || json || [];
          return items.map((s: Record<string, unknown>) => ({
            id: s.id,
            admissionNo: s.admissionNo || '',
            name: (s.user as Record<string, unknown>)?.name || '',
            className: (s.class as Record<string, unknown>)?.name || 'Unassigned',
            gender: s.gender || null,
            gpa: s.gpa ?? null,
            behaviorScore: s.behaviorScore ?? null,
            email: (s.user as Record<string, unknown>)?.email || null,
            phone: (s.user as Record<string, unknown>)?.phone || null,
            classId: s.classId || null,
            isActive: s.isActive ?? true,
          }));
        })
        .catch(() => {
          toast.error('Failed to load students');
          return [];
        }),
      fetch(`/api/classes?schoolId=${selectedSchoolId}&limit=100`)
        .then(res => res.json())
        .then(json => (json.data || json || []).map((c: Record<string, unknown>) => ({
          id: c.id,
          name: c.name,
        })))
        .catch(() => []),
    ])
      .then(([studentData, classData]) => {
        setStudents(studentData);
        setClasses(classData);
      })
      .finally(() => setLoading(false));
  }, [selectedSchoolId]);

  const filtered = classFilter === 'all'
    ? students
    : students.filter(s => s.className === classFilter);

  const handleAddStudent = async () => {
    if (!selectedSchoolId) {
      toast.error('No school selected');
      return;
    }

    const dialog = addOpen ? document.querySelector('[data-student-dialog]') : null;
    if (!dialog) return;

    const form = dialog.querySelector('form') as HTMLFormElement | null;
    if (!form) return;

    const formData = new FormData(form);
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const admissionNo = formData.get('admissionNo') as string;

    if (!name || !email || !admissionNo) {
      toast.error('Name, email, and admission number are required');
      return;
    }

    setAdding(true);
    try {
      const res = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          schoolId: selectedSchoolId,
          name,
          email,
          admissionNo,
          classId: formData.get('classId') || null,
          gender: formData.get('gender') || null,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to create student');

      toast.success('Student added successfully');
      setAddOpen(false);

      // Refresh data
      const refreshed = await fetch(`/api/students?schoolId=${selectedSchoolId}&limit=100`)
        .then(r => r.json())
        .then(j => (j.data || j || []).map((s: Record<string, unknown>) => ({
          id: s.id,
          admissionNo: s.admissionNo || '',
          name: (s.user as Record<string, unknown>)?.name || '',
          className: (s.class as Record<string, unknown>)?.name || 'Unassigned',
          gender: s.gender || null,
          gpa: s.gpa ?? null,
          behaviorScore: s.behaviorScore ?? null,
          email: (s.user as Record<string, unknown>)?.email || null,
          phone: (s.user as Record<string, unknown>)?.phone || null,
          classId: s.classId || null,
          isActive: s.isActive ?? true,
        })));
      setStudents(refreshed);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to add student');
    } finally {
      setAdding(false);
    }
  };

  if (!selectedSchoolId) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <GraduationCap className="size-12 opacity-30" />
        <p className="mt-3 text-sm">Select a school to view students</p>
      </div>
    );
  }

  if (loading) return <LoadingSkeleton />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Students</h2>
          <p className="text-sm text-muted-foreground">{students.length} total students enrolled</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={classFilter} onValueChange={setClassFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Filter by class" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Classes</SelectItem>
              {classes.map(c => (
                <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="size-4" />
                Add Student
              </Button>
            </DialogTrigger>
            <DialogContent data-student-dialog>
              <DialogHeader>
                <DialogTitle>Add New Student</DialogTitle>
                <DialogDescription>Enter the student&apos;s details below.</DialogDescription>
              </DialogHeader>
              <form onSubmit={(e) => { e.preventDefault(); handleAddStudent(); }}>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label>Full Name</Label>
                    <Input name="name" placeholder="Enter student name" required />
                  </div>
                  <div className="grid gap-2">
                    <Label>Email</Label>
                    <Input name="email" type="email" placeholder="student@school.com" required />
                  </div>
                  <div className="grid gap-2">
                    <Label>Admission No</Label>
                    <Input name="admissionNo" placeholder="e.g. GFA/2025/013" required />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label>Class</Label>
                      <Select name="classId">
                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent>
                          {classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label>Gender</Label>
                      <Select name="gender">
                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Male">Male</SelectItem>
                          <SelectItem value="Female">Female</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
                  <Button type="submit" disabled={adding}>
                    {adding && <Loader2 className="size-4 animate-spin mr-1" />}
                    Add Student
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        searchKey="name"
        searchPlaceholder="Search students..."
        emptyMessage="No students found."
        onRowClick={(student) => setDetailStudent(student)}
      />

      <Dialog open={!!detailStudent} onOpenChange={() => setDetailStudent(null)}>
        <DialogContent className="max-w-lg">
          {detailStudent && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <User className="size-5" />
                  {detailStudent.name}
                </DialogTitle>
                <DialogDescription>{detailStudent.admissionNo}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-sm">
                    <span className="text-muted-foreground">Class</span>
                    <p className="font-medium">{detailStudent.className}</p>
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">Gender</span>
                    <p className="font-medium">{detailStudent.gender || '—'}</p>
                  </div>
                  {detailStudent.email && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">Email</span>
                      <p className="font-medium text-xs">{detailStudent.email}</p>
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Card className="p-3">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <BarChart3 className="size-3.5" />
                      GPA
                    </div>
                    <p className="text-lg font-bold mt-1">{detailStudent.gpa != null ? detailStudent.gpa.toFixed(1) : '—'}</p>
                  </Card>
                  <Card className="p-3">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <GraduationCap className="size-3.5" />
                      Behavior
                    </div>
                    <p className="text-lg font-bold mt-1">{detailStudent.behaviorScore != null ? `${detailStudent.behaviorScore}/100` : '—'}</p>
                  </Card>
                  <Card className="p-3">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <BookOpen className="size-3.5" />
                      Status
                    </div>
                    <StatusBadge variant={detailStudent.isActive ? 'success' : 'warning'} size="sm">
                      {detailStudent.isActive ? 'Active' : 'Inactive'}
                    </StatusBadge>
                  </Card>
                  <Card className="p-3">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <CalendarCheck className="size-3.5" />
                      Class
                    </div>
                    <p className="text-sm font-bold mt-1">{detailStudent.className}</p>
                  </Card>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
