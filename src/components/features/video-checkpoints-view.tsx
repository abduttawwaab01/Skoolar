'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  Plus, Video, Clock, Pencil, Trash2, CheckCircle2, AlertTriangle, ListChecks, MonitorPlay, GraduationCap,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAppStore } from '@/store/app-store';

interface VideoLesson {
  id: string;
  title: string;
  subjectName: string | null;
  className: string | null;
}

interface Checkpoint {
  id: string;
  lessonId: string;
  timestamp: number;
  question: string;
  questionType: 'MCQ' | 'TRUE_FALSE';
  options: string | null;
  correctAnswer: string | null;
  explanation: string | null;
  order: number;
  isRequired: boolean;
  _count?: { progress: number };
}

export function VideoCheckpointsView() {
  const { currentUser, selectedSchoolId } = useAppStore();
  const schoolId = currentUser?.schoolId || selectedSchoolId || '';

  const [lessons, setLessons] = useState<VideoLesson[]>([]);
  const [checkpoints, setCheckpoints] = useState<Checkpoint[]>([]);
  const [selectedLessonId, setSelectedLessonId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [checkpointsLoading, setCheckpointsLoading] = useState(false);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCheckpoint, setEditingCheckpoint] = useState<Checkpoint | null>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    timestamp: '',
    question: '',
    questionType: 'MCQ' as 'MCQ' | 'TRUE_FALSE',
    options: '',
    correctAnswer: '',
    explanation: '',
    isRequired: true,
  });

  const fetchLessons = useCallback(async () => {
    if (!schoolId) { setLoading(false); return; }
    try {
      const res = await fetch(`/api/video-lessons?schoolId=${schoolId}&limit=50`);
      if (res.ok) {
        const json = await res.json();
        setLessons(json.data || []);
      }
    } catch { /* ignore */ } finally { setLoading(false); }
  }, [schoolId]);

  const fetchCheckpoints = useCallback(async (lessonId: string) => {
    if (!lessonId) { setCheckpoints([]); return; }
    setCheckpointsLoading(true);
    try {
      const res = await fetch(`/api/video-checkpoints?lessonId=${lessonId}`);
      if (res.ok) {
        const json = await res.json();
        setCheckpoints(json.data || []);
      }
    } catch { toast.error('Failed to load checkpoints'); }
    finally { setCheckpointsLoading(false); }
  }, []);

  useEffect(() => { fetchLessons(); }, [fetchLessons]);
  useEffect(() => { fetchCheckpoints(selectedLessonId); }, [selectedLessonId, fetchCheckpoints]);

  const resetForm = () => {
    setFormData({ timestamp: '', question: '', questionType: 'MCQ', options: '', correctAnswer: '', explanation: '', isRequired: true });
    setEditingCheckpoint(null);
  };

  const openCreate = () => { resetForm(); setDialogOpen(true); };

  const openEdit = (cp: Checkpoint) => {
    setEditingCheckpoint(cp);
    setFormData({
      timestamp: cp.timestamp.toString(),
      question: cp.question,
      questionType: cp.questionType,
      options: cp.options || '',
      correctAnswer: cp.correctAnswer || '',
      explanation: cp.explanation || '',
      isRequired: cp.isRequired,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!selectedLessonId || !formData.question) { toast.error('Question is required'); return; }
    if (formData.questionType === 'MCQ' && !formData.options) { toast.error('Options are required for MCQ'); return; }
    setSaving(true);
    try {
      const body = {
        lessonId: selectedLessonId,
        timestamp: parseInt(formData.timestamp) || 0,
        question: formData.question,
        questionType: formData.questionType,
        options: formData.questionType === 'MCQ' ? formData.options : null,
        correctAnswer: formData.correctAnswer || null,
        explanation: formData.explanation || null,
        isRequired: formData.isRequired,
      };

      if (editingCheckpoint) {
        const res = await fetch('/api/video-checkpoints', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingCheckpoint.id, ...body }),
        });
        if (!res.ok) throw new Error('Failed to update');
        toast.success('Checkpoint updated');
      } else {
        const res = await fetch('/api/video-checkpoints', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error('Failed to create');
        toast.success('Checkpoint created');
      }
      setDialogOpen(false);
      resetForm();
      fetchCheckpoints(selectedLessonId);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/video-checkpoints?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      setCheckpoints(prev => prev.filter(c => c.id !== id));
      toast.success('Checkpoint deleted');
    } catch { toast.error('Failed to delete checkpoint'); }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const selectedLesson = lessons.find(l => l.id === selectedLessonId);
  const parsedOptions = formData.questionType === 'MCQ' ? formData.options.split('\n').filter(Boolean) : [];

  if (loading) return <div className="space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-64" /></div>;

  if (!schoolId) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <MonitorPlay className="size-10 mb-3" />
        <p className="text-sm font-medium">No school selected</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-100">
            <ListChecks className="h-6 w-6 text-cyan-700" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Video Checkpoints</h1>
            <p className="text-sm text-muted-foreground">Manage in-video questions for your lessons</p>
          </div>
        </div>
      </div>

      {/* Lesson Selector */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Video className="h-4 w-4" /> Select Lesson
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedLessonId} onValueChange={setSelectedLessonId}>
            <SelectTrigger className="w-full max-w-md">
              <SelectValue placeholder="Choose a video lesson..." />
            </SelectTrigger>
            <SelectContent>
              {lessons.map(l => (
                <SelectItem key={l.id} value={l.id}>
                  {l.title} {l.subjectName ? `(${l.subjectName})` : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedLessonId && (
        <>
          {/* Add Checkpoint Button */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="gap-1">
                <ListChecks className="h-3 w-3" />
                {checkpoints.length} checkpoint{checkpoints.length !== 1 ? 's' : ''}
              </Badge>
              <Badge variant="outline" className="gap-1">
                <GraduationCap className="h-3 w-3" />
                {selectedLesson?.subjectName || 'General'}
              </Badge>
            </div>
            <Button size="sm" onClick={openCreate}><Plus className="h-4 w-4 mr-1" /> Add Checkpoint</Button>
          </div>

          {/* Checkpoint List */}
          {checkpointsLoading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => <Skeleton key={i} className="h-24" />)}
            </div>
          ) : checkpoints.length === 0 ? (
            <Card className="py-12 text-center">
              <ListChecks className="h-12 w-12 mx-auto text-muted-foreground/40 mb-3" />
              <p className="text-sm font-medium">No checkpoints yet</p>
              <p className="text-xs text-muted-foreground mt-1">Add in-video questions to keep students engaged</p>
              <Button variant="outline" size="sm" className="mt-4" onClick={openCreate}>
                <Plus className="h-4 w-4 mr-1" /> Add First Checkpoint
              </Button>
            </Card>
          ) : (
            <div className="space-y-3">
              {checkpoints.sort((a, b) => a.timestamp - b.timestamp).map((cp, idx) => (
                <Card key={cp.id} className="hover:shadow-sm transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono bg-muted px-2 py-0.5 rounded flex items-center gap-1">
                            <Clock className="h-3 w-3" /> {formatTime(cp.timestamp)}
                          </span>
                          <Badge variant="outline" className="text-[10px]">
                            {cp.questionType === 'MCQ' ? 'Multiple Choice' : 'True/False'}
                          </Badge>
                          {cp.isRequired && (
                            <Badge variant="secondary" className="text-[10px]">Required</Badge>
                          )}
                          <span className="text-xs text-muted-foreground">#{idx + 1}</span>
                        </div>
                        <p className="text-sm font-medium">{cp.question}</p>
                        {cp.options && cp.questionType === 'MCQ' && (
                          <div className="flex flex-wrap gap-1">
                            {JSON.parse(cp.options).map((opt: string, i: number) => (
                              <Badge key={i} variant="outline" className="text-[10px]">{opt}</Badge>
                            ))}
                          </div>
                        )}
                        {cp.correctAnswer && (
                          <div className="flex items-center gap-1 text-xs text-emerald-600">
                            <CheckCircle2 className="h-3 w-3" />
                            Answer: {cp.correctAnswer}
                          </div>
                        )}
                        {cp._count && (
                          <p className="text-xs text-muted-foreground">{cp._count.progress} student{cp._count.progress !== 1 ? 's' : ''} answered</p>
                        )}
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Button variant="ghost" size="icon" className="size-7" onClick={() => openEdit(cp)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="size-7 text-red-500" onClick={() => handleDelete(cp.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Create/Edit Dialog */}
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>{editingCheckpoint ? 'Edit Checkpoint' : 'Add Checkpoint'}</DialogTitle>
                <DialogDescription>
                  {editingCheckpoint ? 'Update the checkpoint question and settings' : 'Create a question that appears at a specific timestamp in the video'}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Timestamp (seconds)</Label>
                    <Input type="number" min="0" placeholder="e.g. 120" value={formData.timestamp} onChange={e => setFormData(p => ({ ...p, timestamp: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Question Type</Label>
                    <Select value={formData.questionType} onValueChange={v => setFormData(p => ({ ...p, questionType: v as 'MCQ' | 'TRUE_FALSE', correctAnswer: '', options: '' }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MCQ">Multiple Choice</SelectItem>
                        <SelectItem value="TRUE_FALSE">True / False</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Question</Label>
                  <Textarea placeholder="Enter the checkpoint question..." rows={2} value={formData.question} onChange={e => setFormData(p => ({ ...p, question: e.target.value }))} />
                </div>
                {formData.questionType === 'MCQ' && (
                  <div className="space-y-2">
                    <Label>Options (one per line)</Label>
                    <Textarea placeholder={`Option A\nOption B\nOption C\nOption D`} rows={4} value={formData.options} onChange={e => setFormData(p => ({ ...p, options: e.target.value }))} />
                    <p className="text-xs text-muted-foreground">Enter the index (0-based) in Correct Answer, e.g. &quot;0&quot; for first option</p>
                  </div>
                )}
                <div className="space-y-2">
                  <Label>Correct Answer</Label>
                  {formData.questionType === 'MCQ' ? (
                    <Select value={formData.correctAnswer} onValueChange={v => setFormData(p => ({ ...p, correctAnswer: v }))}>
                      <SelectTrigger><SelectValue placeholder="Select correct answer" /></SelectTrigger>
                      <SelectContent>
                        {parsedOptions.map((opt, i) => (
                          <SelectItem key={i} value={i.toString()}>{i} - {opt}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Select value={formData.correctAnswer} onValueChange={v => setFormData(p => ({ ...p, correctAnswer: v }))}>
                      <SelectTrigger><SelectValue placeholder="Is it true or false?" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">True</SelectItem>
                        <SelectItem value="false">False</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Explanation (shown after answering)</Label>
                  <Textarea placeholder="Explain the correct answer..." rows={2} value={formData.explanation} onChange={e => setFormData(p => ({ ...p, explanation: e.target.value }))} />
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={formData.isRequired} onCheckedChange={v => setFormData(p => ({ ...p, isRequired: v }))} />
                  <Label className="text-sm">Required (must answer to continue watching)</Label>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => { setDialogOpen(false); resetForm(); }}>Cancel</Button>
                <Button onClick={handleSave} disabled={saving || !formData.question}>
                  {saving ? 'Saving...' : editingCheckpoint ? 'Update' : 'Create'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
}
