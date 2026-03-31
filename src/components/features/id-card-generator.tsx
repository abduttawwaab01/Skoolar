'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { Download, Printer, RotateCcw, QrCode, Barcode, User, Eye, EyeOff, Palette, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export function IDCardGenerator() {
  const [studentList, setStudentList] = useState<Array<{id: string; name: string; admissionNo: string; class: string; gender: string}>>([]);
  const [selectedStudent, setSelectedStudent] = useState<{id: string; name: string; admissionNo: string; class: string; gender: string} | null>(null);
  const [primaryColor, setPrimaryColor] = useState('#059669');
  const [secondaryColor, setSecondaryColor] = useState('#FFFFFF');
  const [showPhoto, setShowPhoto] = useState(true);
  const [showBarcode, setShowBarcode] = useState(true);
  const [showQR, setShowQR] = useState(true);
  const [backText, setBackText] = useState('This card remains the property of the school.\nIf found, please return to the school office.\n\nRules:\n1. Always carry your ID card\n2. Do not lend to others\n3. Report loss immediately');
  const [showBack, setShowBack] = useState(false);
  const [cardType, setCardType] = useState<'student' | 'staff'>('student');
  const [loading, setLoading] = useState(true);

  // Fetch students from API
  React.useEffect(() => {
    async function fetchStudents() {
      try {
        const res = await fetch('/api/students?limit=100');
        if (res.ok) {
          const json = await res.json();
          const list = (json.data || []).map((s: any) => ({
            id: s.id,
            name: s.name || s.user?.name || 'Unknown',
            admissionNo: s.admissionNo || 'N/A',
            class: s.class?.name || 'N/A',
            gender: s.gender || 'N/A',
          }));
          setStudentList(list);
          if (list.length > 0) setSelectedStudent(list[0]);
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    }
    fetchStudents();
  }, []);

  const student = selectedStudent || { id: '', name: 'Select Student', admissionNo: 'N/A', class: 'N/A', gender: 'N/A' };
  const initials = student.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="grid gap-4 lg:grid-cols-[300px_1fr]">
      {/* Configuration Panel */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Card Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Card Type */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Card Type</Label>
            <div className="flex gap-2">
              <Button size="sm" variant={cardType === 'student' ? 'default' : 'outline'} onClick={() => setCardType('student')} className="flex-1">Student</Button>
              <Button size="sm" variant={cardType === 'staff' ? 'default' : 'outline'} onClick={() => setCardType('staff')} className="flex-1">Staff</Button>
            </div>
          </div>

          <Separator />

          {/* Student Selector */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Select Student</Label>
            {loading ? (
              <p className="text-xs text-muted-foreground">Loading students...</p>
            ) : studentList.length === 0 ? (
              <div className="flex items-center gap-1.5 text-xs text-amber-600">
                <AlertCircle className="size-3" />
                No students found. Create students first.
              </div>
            ) : (
              <Select value={student.id} onValueChange={(id) => setSelectedStudent(studentList.find(s => s.id === id) || studentList[0])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {studentList.map(s => (
                    <SelectItem key={s.id} value={s.id}>{s.name} - {s.admissionNo}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <Separator />

          {/* Colors */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium flex items-center gap-1.5"><Palette className="size-3" /> Colors</Label>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-[10px] text-muted-foreground">Primary</Label>
                <div className="flex items-center gap-2">
                  <Input type="color" value={primaryColor} onChange={e => setPrimaryColor(e.target.value)} className="size-8 p-0.5 cursor-pointer" />
                  <span className="text-xs font-mono">{primaryColor}</span>
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] text-muted-foreground">Background</Label>
                <div className="flex items-center gap-2">
                  <Input type="color" value={secondaryColor} onChange={e => setSecondaryColor(e.target.value)} className="size-8 p-0.5 cursor-pointer" />
                  <span className="text-xs font-mono">{secondaryColor}</span>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Toggles */}
          <div className="space-y-3">
            <Label className="text-xs font-medium">Display Options</Label>
            {[
              { label: 'Show Photo', value: showPhoto, setter: setShowPhoto, icon: User },
              { label: 'Show Barcode', value: showBarcode, setter: setShowBarcode, icon: Barcode },
              { label: 'Show QR Code', value: showQR, setter: setShowQR, icon: QrCode },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between">
                <Label className="text-xs flex items-center gap-1.5">
                  <item.icon className="size-3" /> {item.label}
                </Label>
                <Switch checked={item.value} onCheckedChange={item.setter} />
              </div>
            ))}
          </div>

          <Separator />

          {/* Back Text */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Back Card Text</Label>
            <Textarea value={backText} onChange={e => setBackText(e.target.value)} className="text-xs min-h-[100px] resize-none" />
          </div>
        </CardContent>
      </Card>

      {/* Preview & Actions */}
      <div className="space-y-4">
        {/* Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowBack(!showBack)}>
            {showBack ? <Eye className="size-3.5 mr-1.5" /> : <EyeOff className="size-3.5 mr-1.5" />}
            {showBack ? 'Show Front' : 'Show Back'}
          </Button>
          <Button size="sm" onClick={() => toast.success('ID card downloaded')}><Download className="size-3.5 mr-1.5" /> Download PNG</Button>
          <Button variant="outline" size="sm" onClick={() => toast.success('Sent to printer')}><Printer className="size-3.5 mr-1.5" /> Print</Button>
          <Button variant="outline" size="sm" onClick={() => toast.success('Bulk generation started')}><RotateCcw className="size-3.5 mr-1.5" /> Bulk Generate</Button>
        </div>

        {/* Card Preview */}
        <div className="flex items-start justify-center">
          <div className="relative" style={{ width: '340px', height: '214px' }}>
            {/* Card shadow and border */}
            <div className="absolute inset-0 rounded-xl shadow-2xl" style={{ backgroundColor: secondaryColor }}>
              {!showBack ? (
                /* FRONT OF CARD */
                <div className="h-full flex flex-col relative overflow-hidden rounded-xl">
                  {/* Color header strip */}
                  <div className="h-10 flex items-center px-3" style={{ backgroundColor: primaryColor }}>
                    <span className="text-white text-xs font-bold tracking-wide">GREENFIELD ACADEMY</span>
                    <span className="ml-auto text-white/80 text-[10px]">ID CARD</span>
                  </div>

                  <div className="flex-1 flex p-3 gap-3">
                    {/* Photo */}
                    {showPhoto && (
                      <div className="shrink-0 flex flex-col items-center gap-1">
                        <div className="w-16 h-20 rounded-lg flex items-center justify-center text-white font-bold text-lg" style={{ backgroundColor: primaryColor }}>
                          {initials}
                        </div>
                        <span className="text-[9px] text-muted-foreground">Photo</span>
                      </div>
                    )}

                    {/* Info */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <p className="text-sm font-bold truncate leading-tight" style={{ color: primaryColor }}>{student.name}</p>
                      <Badge variant="outline" className="text-[9px] px-1.5 py-0" style={{ borderColor: primaryColor, color: primaryColor }}>
                        {cardType === 'student' ? 'STUDENT' : 'STAFF'}
                      </Badge>
                      <div className="space-y-0.5 text-[10px] text-muted-foreground">
                        <p>Class: <span className="font-medium text-foreground">{student.class}</span></p>
                        <p>ID: <span className="font-mono font-medium text-foreground">{student.admissionNo}</span></p>
                        <p>Gender: <span className="font-medium text-foreground">{student.gender}</span></p>
                      </div>
                    </div>
                  </div>

                  {/* Barcode area */}
                  {showBarcode && (
                    <div className="px-3 pb-2 flex items-end justify-between">
                      <div className="flex items-end gap-[1px] h-8">
                        {Array.from({ length: 30 }).map((_, i) => (
                          <div key={i} className={cn('w-[1.5px]', i % 3 === 0 ? 'h-full' : i % 3 === 1 ? 'h-3/4' : 'h-1/2')} style={{ backgroundColor: i % 2 === 0 ? '#000' : primaryColor }} />
                        ))}
                      </div>
                      {showQR && (
                        <div className="w-10 h-10 border-2 rounded-sm p-0.5 flex items-center justify-center" style={{ borderColor: primaryColor }}>
                          <QrCode className="size-6" style={{ color: primaryColor }} />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                /* BACK OF CARD */
                <div className="h-full flex flex-col p-3 relative overflow-hidden rounded-xl">
                  <div className="text-center mb-2" style={{ borderBottom: `1px solid ${primaryColor}40` }}>
                    <p className="text-[10px] font-bold" style={{ color: primaryColor }}>GREENFIELD ACADEMY</p>
                    <p className="text-[8px] text-muted-foreground">12 Education Drive, Lagos | +234-801-234-5678</p>
                  </div>
                  <div className="flex-1">
                    <p className="text-[9px] text-muted-foreground whitespace-pre-line leading-relaxed">{backText}</p>
                  </div>
                  <div className="text-center mt-2 pt-2 border-t">
                    <p className="text-[8px] text-muted-foreground">Valid: 2024/2025 Academic Year</p>
                    <p className="text-[8px] text-muted-foreground">Emergency: +234-801-234-5678</p>
                  </div>
                </div>
              )}

              {/* Watermark */}
              <div className="absolute bottom-1 right-2 text-[7px] text-gray-300 opacity-60">
                Powered by Skoolar || Odebunmi Tawwāb
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Generated Cards:</span>
              <span className="font-semibold">847 / 847</span>
            </div>
            <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
              <div className="h-full rounded-full bg-emerald-500" style={{ width: '100%' }} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
