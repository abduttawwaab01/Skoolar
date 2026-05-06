'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ClipboardList, Plus, CheckCircle2, Clock, AlertTriangle, 
  Calendar, User, BookOpen, FileText, Users, TrendingUp,
  Award, Check, X, Filter
} from 'lucide-react';
import { useAppStore } from '@/store/app-store';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface TeacherTask {
  id: string;
  title: string;
  description: string | null;
  taskType: string;
  dueDate: string | null;
  priority: string;
  status: string;
  createdAt: string;
  teacher: {
    id: string;
    name: string;
    avatar: string | null;
  };
  completion: {
    status: string;
    notes: string | null;
    completedAt: string | null;
    feedback: string | null;
  } | null;
}

interface TeacherPerformance {
  id: string;
  teacherId: string;
  teacherName: string;
  teacherAvatar: string | null;
  taskCompletionScore: number;
  punctualityScore: number;
  classScore: number;
  studentFeedbackScore: number;
  weeklyEvalScore: number;
  totalScore: number;
  rank: number;
}

const taskTypeLabels: Record<string, { label: string; icon: React.ReactNode }> = {
  reading: { label: 'Reading Assignment', icon: <BookOpen className="h-4 w-4" /> },
  lesson_plan: { label: 'Lesson Plan', icon: <FileText className="h-4 w-4" /> },
  report: { label: 'Report', icon: <FileText className="h-4 w-4" /> },
  meeting: { label: 'Meeting', icon: <Users className="h-4 w-4" /> },
  class_management: { label: 'Class Management', icon: <ClipboardList className="h-4 w-4" /> },
  other: { label: 'Other', icon: <ClipboardList className="h-4 w-4" /> },
};

const priorityColors: Record<string, string> = {
  low: 'bg-gray-100 text-gray-700',
  medium: 'bg-blue-100 text-blue-700',
  high: 'bg-orange-100 text-orange-700',
  urgent: 'bg-red-100 text-red-700',
};

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  in_progress: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
  overdue: 'bg-red-100 text-red-700',
};

export function TeacherTasksManagement() {
  const { currentUser, selectedSchoolId } = useAppStore();
  const schoolId = currentUser.schoolId || selectedSchoolId || '';
  
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<TeacherTask[]>([]);
  const [teachers, setTeachers] = useState<Array<{id: string; name: string}>>([]);
  const [performances, setPerformances] = useState<TeacherPerformance[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const [newTask, setNewTask] = useState({
    teacherId: '',
    title: '',
    description: '',
    taskType: 'reading',
    dueDate: '',
    priority: 'medium',
  });

  useEffect(() => {
    fetchTasks();
    fetchTeachers();
    fetchPerformance();
  }, [schoolId]);

  async function fetchTasks() {
    try {
      const params = new URLSearchParams();
      params.set('schoolId', schoolId);
      if (filterStatus !== 'all') params.set('status', filterStatus);
      
      const res = await fetch(`/api/teacher-tasks?${params}`);
      if (res.ok) {
        const json = await res.json();
        setTasks(json.data || json || []);
      }
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchTeachers() {
    try {
      const res = await fetch(`/api/teachers?schoolId=${schoolId}&limit=100`);
      if (res.ok) {
        const json = await res.json();
        setTeachers(json.data || json || []);
      }
    } catch (error) {
      console.error('Failed to fetch teachers:', error);
    }
  }

  async function fetchPerformance() {
    try {
      const res = await fetch(`/api/teacher-performance?schoolId=${schoolId}`);
      if (res.ok) {
        const json = await res.json();
        setPerformances(json.data || json || []);
      }
    } catch (error) {
      console.error('Failed to fetch performance:', error);
    }
  }

  async function handleCreateTask() {
    if (!newTask.teacherId || !newTask.title || !newTask.taskType) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const res = await fetch('/api/teacher-tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newTask,
          schoolId,
          dueDate: newTask.dueDate || null,
        }),
      });

      if (res.ok) {
        toast.success('Task created successfully');
        setShowCreateDialog(false);
        setNewTask({ teacherId: '', title: '', description: '', taskType: 'reading', dueDate: '', priority: 'medium' });
        fetchTasks();
      } else {
        const json = await res.json();
        toast.error(json.error || 'Failed to create task');
      }
    } catch (error) {
      console.error('Failed to create task:', error);
      toast.error('Failed to create task');
    }
  }

  async function handleVerifyCompletion(taskId: string, approved: boolean) {
    try {
      // Find the completion
      const task = tasks.find(t => t.id === taskId);
      if (!task?.completion) {
        toast.error('No completion record found');
        return;
      }

      const completionData = task.completion as { id?: string; status: string };
      if (!completionData.id) {
        toast.error('No completion ID found');
        return;
      }

      const res = await fetch('/api/teacher-tasks/complete', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          completionId: completionData.id,
          status: approved ? 'approved' : 'rejected',
          feedback: approved ? 'Great work!' : 'Please review and resubmit.',
        }),
      });

      if (res.ok) {
        toast.success(approved ? 'Task approved' : 'Task rejected');
        fetchTasks();
        fetchPerformance();
      }
    } catch (error) {
      console.error('Failed to verify task:', error);
      toast.error('Failed to verify task');
    }
  }

  async function calculatePerformance() {
    try {
      const res = await fetch('/api/teacher-performance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ schoolId }),
      });

      if (res.ok) {
        toast.success('Performance calculated successfully');
        fetchPerformance();
      }
    } catch (error) {
      console.error('Failed to calculate performance:', error);
      toast.error('Failed to calculate performance');
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i}><CardContent className="p-6"><div className="h-20 bg-muted animate-pulse rounded" /></CardContent></Card>
          ))}
        </div>
      </div>
    );
  }

  const pendingTasks = tasks.filter(t => t.status === 'pending');
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress');
  const completedTasks = tasks.filter(t => t.completion?.status === 'pending');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Teacher Evaluation & Tasks</h2>
          <p className="text-muted-foreground">Manage teacher tasks and track performance</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={calculatePerformance} variant="outline">
            <TrendingUp className="h-4 w-4 mr-2" />
            Calculate Performance
          </Button>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Assign Task
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Assign Task to Teacher</DialogTitle>
                <DialogDescription>Create a new task for a teacher</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label>Teacher</Label>
                  <Select value={newTask.teacherId} onValueChange={v => setNewTask({...newTask, teacherId: v})}>
                    <SelectTrigger><SelectValue placeholder="Select teacher" /></SelectTrigger>
                    <SelectContent>
                      {teachers.map(t => (
                        <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Task Title</Label>
                  <Input value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} placeholder="Enter task title" />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea value={newTask.description} onChange={e => setNewTask({...newTask, description: e.target.value})} placeholder="Task details" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Task Type</Label>
                    <Select value={newTask.taskType} onValueChange={v => setNewTask({...newTask, taskType: v})}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {Object.entries(taskTypeLabels).map(([key, {label}]) => (
                          <SelectItem key={key} value={key}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Priority</Label>
                    <Select value={newTask.priority} onValueChange={v => setNewTask({...newTask, priority: v})}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>Due Date (Optional)</Label>
                  <Input type="date" value={newTask.dueDate} onChange={e => setNewTask({...newTask, dueDate: e.target.value})} />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Cancel</Button>
                <Button onClick={handleCreateTask}>Create Task</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{pendingTasks.length}</p>
              <p className="text-sm text-muted-foreground">Pending Tasks</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
              <ClipboardList className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{inProgressTasks.length}</p>
              <p className="text-sm text-muted-foreground">In Progress</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{completedTasks.length}</p>
              <p className="text-sm text-muted-foreground">Awaiting Review</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
              <Award className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{performances.length}</p>
              <p className="text-sm text-muted-foreground">Teachers Ranked</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="tasks">
        <TabsList>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="performance">Performance Rankings</TabsTrigger>
        </TabsList>

        <TabsContent value="tasks" className="space-y-4">
          {/* Filter */}
          <div className="flex gap-2">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40"><SelectValue placeholder="Filter" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tasks</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tasks List */}
          <div className="space-y-4">
            {tasks.map(task => (
              <Card key={task.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={priorityColors[task.priority]}>{task.priority}</Badge>
                        <Badge className={statusColors[task.status]}>{task.status.replace('_', ' ')}</Badge>
                        <Badge variant="outline">{taskTypeLabels[task.taskType]?.label || task.taskType}</Badge>
                      </div>
                      <h3 className="font-semibold">{task.title}</h3>
                      {task.description && <p className="text-sm text-muted-foreground mt-1">{task.description}</p>}
                      <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1"><User className="h-4 w-4" /> {task.teacher.name}</span>
                        {task.dueDate && (
                          <span className="flex items-center gap-1"><Calendar className="h-4 w-4" /> Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                    
                    {/* Completion Actions */}
                    {task.completion?.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="text-green-600" onClick={() => handleVerifyCompletion(task.id, true)}>
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" className="text-red-600" onClick={() => handleVerifyCompletion(task.id, false)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}

            {tasks.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <ClipboardList className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No tasks found</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Teacher Performance Rankings</CardTitle>
              <CardDescription>Rankings based on tasks, punctuality, class management, and evaluations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {performances.map((perf, i) => (
                  <div key={perf.id} className="flex items-center gap-4 p-4 rounded-lg border bg-card">
                    <div className={cn(
                      "h-10 w-10 rounded-full flex items-center justify-center font-bold",
                      i === 0 ? "bg-yellow-100 text-yellow-700" :
                      i === 1 ? "bg-gray-100 text-gray-700" :
                      i === 2 ? "bg-orange-100 text-orange-700" :
                      "bg-muted text-muted-foreground"
                    )}>
                      {perf.rank}
                    </div>
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      {perf.teacherAvatar ? (
                        <img src={perf.teacherAvatar} alt="" className="h-10 w-10 rounded-full object-cover" />
                      ) : (
                        <User className="h-5 w-5" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">{perf.teacherName}</p>
                      <div className="flex gap-4 text-sm text-muted-foreground">
                        <span>Tasks: {perf.taskCompletionScore}%</span>
                        <span>Punctuality: {perf.punctualityScore}%</span>
                        <span>Class: {perf.classScore}%</span>
                        <span>Eval: {perf.weeklyEvalScore}%</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">{perf.totalScore}</p>
                      <p className="text-sm text-muted-foreground">Total Score</p>
                    </div>
                  </div>
                ))}

                {performances.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No performance data. Click "Calculate Performance" to generate rankings.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default TeacherTasksManagement;