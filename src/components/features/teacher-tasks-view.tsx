'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ClipboardList, CheckCircle2, Clock, AlertTriangle, 
  Calendar, BookOpen, FileText, Trophy, Star, Award,
  Target, TrendingUp, Zap
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
  completion: {
    id: string;
    status: string;
    notes: string | null;
    completedAt: string | null;
    feedback: string | null;
  } | null;
}

interface TeacherPerformance {
  rank: number;
  totalScore: number;
  taskCompletionScore: number;
  punctualityScore: number;
  classScore: number;
  weeklyEvalScore: number;
  awards: Array<{ type: string; title: string; icon: string }>;
}

const taskTypeLabels: Record<string, string> = {
  reading: 'Reading Assignment',
  lesson_plan: 'Lesson Plan',
  report: 'Report',
  meeting: 'Meeting',
  class_management: 'Class Management',
  other: 'Other',
};

const priorityColors: Record<string, string> = {
  low: 'bg-gray-100 text-gray-700',
  medium: 'bg-blue-100 text-blue-700',
  high: 'bg-orange-100 text-orange-700',
  urgent: 'bg-red-100 text-red-700',
};

export function TeacherTasksView() {
  const { currentUser, selectedSchoolId } = useAppStore();
  const schoolId = currentUser.schoolId || selectedSchoolId || '';
  const userId = currentUser.id;
  
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<TeacherTask[]>([]);
  const [performance, setPerformance] = useState<TeacherPerformance | null>(null);
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TeacherTask | null>(null);
  const [completionNotes, setCompletionNotes] = useState('');

  useEffect(() => {
    fetchMyTasks();
    fetchMyPerformance();
  }, [schoolId, userId]);

  async function fetchMyTasks() {
    try {
      const res = await fetch(`/api/teacher-tasks?schoolId=${schoolId}`);
      if (res.ok) {
        const json = await res.json();
        const allTasks = json.data || json || [];
        // Filter to only show tasks for current teacher (would need teacher ID from user)
        setTasks(allTasks);
      }
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchMyPerformance() {
    try {
      const res = await fetch(`/api/teacher-performance?schoolId=${schoolId}`);
      if (res.ok) {
        const json = await res.json();
        const perfs = json.data || json || [];
        // Find current user's performance
        // Note: Would need to match with teacher ID from user ID
      }
    } catch (error) {
      console.error('Failed to fetch performance:', error);
    }
  }

  async function handleStartTask(taskId: string) {
    try {
      const res = await fetch('/api/teacher-tasks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: taskId, status: 'in_progress' }),
      });

      if (res.ok) {
        toast.success('Task started! Race you to complete it!');
        fetchMyTasks();
      }
    } catch (error) {
      console.error('Failed to start task:', error);
      toast.error('Failed to start task');
    }
  }

  async function handleSubmitCompletion() {
    if (!selectedTask) return;

    try {
      const res = await fetch('/api/teacher-tasks/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId: selectedTask.id,
          notes: completionNotes,
        }),
      });

      if (res.ok) {
        toast.success('Task completed! Great work!');
        setShowCompleteDialog(false);
        setSelectedTask(null);
        setCompletionNotes('');
        fetchMyTasks();
      } else {
        const json = await res.json();
        toast.error(json.error || 'Failed to submit completion');
      }
    } catch (error) {
      console.error('Failed to submit completion:', error);
      toast.error('Failed to submit completion');
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <Card key={i}><CardContent className="p-6"><div className="h-20 bg-muted animate-pulse rounded" /></CardContent></Card>
          ))}
        </div>
      </div>
    );
  }

  const myPendingTasks = tasks.filter(t => !t.completion && t.status === 'pending');
  const myInProgressTasks = tasks.filter(t => t.status === 'in_progress');
  const myCompletedTasks = tasks.filter(t => t.completion?.status === 'approved');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <ClipboardList className="h-6 w-6" />
            My Tasks
          </h2>
          <p className="text-muted-foreground">Complete your assigned tasks and compete to be the best!</p>
        </div>
      </div>

      {/* My Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-yellow-600">{myPendingTasks.length}</p>
            <p className="text-sm text-muted-foreground">Pending</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-blue-600">{myInProgressTasks.length}</p>
            <p className="text-sm text-muted-foreground">In Progress</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-green-600">{myCompletedTasks.length}</p>
            <p className="text-sm text-muted-foreground">Completed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-purple-600">
              {performance?.rank || '-'}
            </p>
            <p className="text-sm text-muted-foreground">Current Rank</p>
          </CardContent>
        </Card>
      </div>

      {/* Race Challenge Banner */}
      {myPendingTasks.length > 0 && (
        <Card className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Zap className="h-6 w-6" />
                  Task Race!
                </h3>
                <p className="text-white/80 mt-1">
                  You have {myPendingTasks.length} pending task(s). Start now and race to complete them first!
                </p>
              </div>
              <Button variant="secondary" onClick={() => {
                if (myPendingTasks[0]) {
                  handleStartTask(myPendingTasks[0].id);
                }
              }}>
                Start First Task
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">
            Pending ({myPendingTasks.length})
          </TabsTrigger>
          <TabsTrigger value="in_progress">
            In Progress ({myInProgressTasks.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed ({myCompletedTasks.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {myPendingTasks.map(task => (
            <Card key={task.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={priorityColors[task.priority]}>{task.priority}</Badge>
                      <Badge variant="outline">{taskTypeLabels[task.taskType] || task.taskType}</Badge>
                    </div>
                    <h3 className="font-semibold">{task.title}</h3>
                    {task.description && (
                      <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                    )}
                    {task.dueDate && (
                      <p className="text-sm text-muted-foreground mt-2 flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Due: {new Date(task.dueDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <Button onClick={() => handleStartTask(task.id)}>
                    <Zap className="h-4 w-4 mr-2" />
                    Start Race
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {myPendingTasks.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>All caught up! No pending tasks.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="in_progress" className="space-y-4">
          {myInProgressTasks.map(task => (
            <Card key={task.id} className="overflow-hidden border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className="bg-blue-100 text-blue-700">In Progress</Badge>
                      <Badge variant="outline">{taskTypeLabels[task.taskType] || task.taskType}</Badge>
                    </div>
                    <h3 className="font-semibold">{task.title}</h3>
                    {task.description && (
                      <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                    )}
                    <div className="mt-3">
                      <Progress value={50} className="h-2" />
                    </div>
                  </div>
                  <Button onClick={() => {
                    setSelectedTask(task);
                    setShowCompleteDialog(true);
                  }}>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Submit Completion
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {myInProgressTasks.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No tasks in progress.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {myCompletedTasks.map(task => (
            <Card key={task.id} className="overflow-hidden border-green-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className="bg-green-100 text-green-700">✓ Completed</Badge>
                    </div>
                    <h3 className="font-semibold">{task.title}</h3>
                  </div>
                  <Trophy className="h-6 w-6 text-yellow-500" />
                </div>
              </CardContent>
            </Card>
          ))}
          {myCompletedTasks.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Award className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No completed tasks yet.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Completion Dialog */}
      <Dialog open={showCompleteDialog} onOpenChange={setShowCompleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit Task Completion</DialogTitle>
            <DialogDescription>
              Submit your completed task for review
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Task</Label>
              <p className="font-medium">{selectedTask?.title}</p>
            </div>
            <div>
              <Label>Notes (Optional)</Label>
              <Textarea 
                value={completionNotes} 
                onChange={e => setCompletionNotes(e.target.value)}
                placeholder="Describe what you completed..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCompleteDialog(false)}>Cancel</Button>
            <Button onClick={handleSubmitCompletion}>
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Submit Completion
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default TeacherTasksView;