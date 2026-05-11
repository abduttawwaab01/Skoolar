'use client';

import * as React from 'react';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/shared/data-table';
import { StatusBadge } from '@/components/shared/status-badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { useAppStore } from '@/store/app-store';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Plus, Search } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

interface Payment {
  id: string;
  amount: number;
  method: string;
  status: string;
  reference: string | null;
  receiptNo: string;
  createdAt: string;
  studentId: string;
  student?: {
    id: string;
    admissionNo: string;
    user: { name: string | null; email: string | null };
    class: { name: string; section: string | null } | null;
  };
}

type PaymentRow = Payment & { studentName: string };

const statusFilters = ['All', 'Verified', 'Pending', 'Failed'] as const;

function TableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-9 w-24 rounded-md" />)}
      </div>
      <Skeleton className="h-[400px] rounded-xl" />
    </div>
  );
}

export function PaymentsView() {
  const { selectedSchoolId, currentUser } = useAppStore();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = React.useState(false);
  const [activeFilter, setActiveFilter] = React.useState<string>('All');
  const [submitting, setSubmitting] = React.useState(false);
  const [studentSearch, setStudentSearch] = React.useState('');
  const [foundStudents, setFoundStudents] = React.useState<any[]>([]);
  const [isSearching, setIsSearching] = React.useState(false);
  const [studentPopoverOpen, setStudentPopoverOpen] = React.useState(false);

  // Form state
  const [formData, setFormData] = React.useState({
    studentId: '',
    amount: '',
    method: 'bank-transfer',
    reference: '',
    termId: 'first',
  });

  const searchStudents = useCallback(async (q: string) => {
    if (!q || q.length < 2) {
      setFoundStudents([]);
      return;
    }
    setIsSearching(true);
    try {
      const res = await fetch(`/api/students?schoolId=${selectedSchoolId}&search=${q}&limit=5`);
      if (res.ok) {
        const json = await res.json();
        setFoundStudents(json.data || []);
      }
    } catch (err) {
      console.error('Search failed', err);
    } finally {
      setIsSearching(false);
    }
  }, [selectedSchoolId]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (studentSearch) searchStudents(studentSearch);
    }, 500);
    return () => clearTimeout(timer);
  }, [studentSearch, searchStudents]);

  const fetchPayments = useCallback(async () => {
    if (!selectedSchoolId) return;
    try {
      setLoading(true);
      const statusParam = activeFilter !== 'All' ? activeFilter.toLowerCase() : '';
      const url = `/api/payments?schoolId=${selectedSchoolId}&limit=100${statusParam ? `&status=${statusParam}` : ''}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to load payments');
      const json = await res.json();
      setPayments(json.data || []);
    } catch (err) {
      toast.error('Failed to load payments');
    } finally {
      setLoading(false);
    }
  }, [selectedSchoolId, activeFilter]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const tableData = useMemo((): PaymentRow[] => {
    const filtered = activeFilter === 'All' ? payments : payments.filter(p => p.status.toLowerCase() === activeFilter.toLowerCase());
    return filtered.map(p => ({
      ...p,
      studentName: p.student?.user?.name || p.student?.admissionNo || 'Unknown',
    }));
  }, [activeFilter, payments]);

  const columns: ColumnDef<PaymentRow>[] = [
    { accessorKey: 'studentName', header: 'Student' },
    { accessorKey: 'amount', header: 'Amount', cell: ({ row }) => `₦${row.getValue<number>('amount').toLocaleString()}` },
    { accessorKey: 'method', header: 'Method' },
    { accessorKey: 'createdAt', header: 'Date', cell: ({ row }) => new Date(row.getValue<string>('createdAt')).toLocaleDateString() },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const s = row.getValue<string>('status');
        return (
          <StatusBadge variant={s === 'verified' || s === 'completed' ? 'success' : s === 'pending' ? 'warning' : 'error'} size="sm">
            {s}
          </StatusBadge>
        );
      },
    },
    { accessorKey: 'receiptNo', header: 'Receipt' },
    {
      id: 'actions',
      cell: ({ row }) => (
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => handlePrintReceipt(row.original)}
          className="text-blue-600 hover:text-blue-700"
        >
          Receipt
        </Button>
      ),
    },
  ];

  const handlePrintReceipt = (p: PaymentRow) => {
    const doc = new jsPDF() as any;
    
    // Receipt Header
    doc.setFontSize(22);
    doc.text('SKOOLAR PAYMENT RECEIPT', 105, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.text(`Date: ${new Date(p.createdAt).toLocaleDateString()}`, 105, 30, { align: 'center' });
    doc.text(`Receipt No: ${p.receiptNo || 'N/A'}`, 105, 35, { align: 'center' });
    
    // Student Info
    doc.line(20, 45, 190, 45);
    doc.setFontSize(14);
    doc.text('PAYMENT INFORMATION', 20, 55);
    doc.setFontSize(10);
    doc.text(`Student: ${p.studentName}`, 20, 65);
    doc.text(`Admission No: ${p.student?.admissionNo || 'N/A'}`, 20, 70);
    doc.text(`Class: ${p.student?.class?.name || 'N/A'}`, 20, 75);
    doc.text(`Method: ${p.method.toUpperCase()}`, 20, 80);
    doc.text(`Reference: ${p.reference || 'N/A'}`, 20, 85);
    
    // Amount Table
    doc.autoTable({
      startY: 95,
      head: [['Description', 'Amount']],
      body: [
        ['Fee Payment', `NGN ${p.amount.toLocaleString()}`],
        ['Total Paid', `NGN ${p.amount.toLocaleString()}`]
      ],
      theme: 'grid',
      headStyles: { fillStyle: [5, 150, 105] }
    });
    
    // Footer
    doc.text('Thank you for your payment.', 105, doc.lastAutoTable.finalY + 20, { align: 'center' });
    doc.text('This is an electronically generated receipt.', 105, doc.lastAutoTable.finalY + 25, { align: 'center' });
    
    doc.save(`Receipt_${p.receiptNo || p.id}.pdf`);
  };

  const handleSubmit = async () => {
    if (!formData.amount || !formData.method) {
      toast.error('Please fill in amount and method');
      return;
    }
    if (!selectedSchoolId) return;
    try {
      setSubmitting(true);
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          schoolId: selectedSchoolId,
          studentId: formData.studentId || undefined,
          amount: parseFloat(formData.amount),
          method: formData.method,
          reference: formData.reference || undefined,
          termId: formData.termId || undefined,
          status: 'pending',
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to record payment');
      }
      toast.success('Payment recorded successfully');
      setOpen(false);
      setFormData({ studentId: '', amount: '', method: '', reference: '', termId: '' });
      fetchPayments();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to record payment');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header + Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold">Payments</h2>
          <p className="text-sm text-muted-foreground">Manage student fee payments</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="size-4 mr-2" />Record Payment</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Record Payment</DialogTitle>
              <DialogDescription>Record a new fee payment from a student.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-2">
              <div className="space-y-2">
                <Label>Student</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input 
                    placeholder="Type to search student..." 
                    className="pl-9" 
                    value={studentSearch} 
                    onChange={e => setStudentSearch(e.target.value)} 
                  />
                </div>
                {foundStudents.length > 0 && (
                  <div className="border rounded-md mt-1 divide-y bg-white shadow-sm max-h-40 overflow-y-auto">
                    {foundStudents.map(s => (
                      <div 
                        key={s.id} 
                        className={cn(
                          "p-2 hover:bg-emerald-50 cursor-pointer text-sm flex items-center justify-between",
                          formData.studentId === s.id && "bg-emerald-50"
                        )}
                        onClick={() => {
                          setFormData(f => ({ ...f, studentId: s.id }));
                          setStudentSearch(s.user.name);
                          setFoundStudents([]);
                        }}
                      >
                        <div>
                          <p className="font-medium">{s.user.name}</p>
                          <p className="text-[10px] text-muted-foreground">{s.admissionNo} • {s.class?.name || 'No Class'}</p>
                        </div>
                        {formData.studentId === s.id && <Plus className="size-4 text-emerald-600 rotate-45" />}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label>Amount (₦)</Label>
                <Input placeholder="150000" type="number" value={formData.amount} onChange={e => setFormData(f => ({ ...f, amount: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Method</Label>
                <Select value={formData.method} onValueChange={v => setFormData(f => ({ ...f, method: v }))}>
                  <SelectTrigger className="w-full"><SelectValue placeholder="Select method" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bank-transfer">Bank Transfer</SelectItem>
                    <SelectItem value="card">Card</SelectItem>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="online">Online</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Reference</Label>
                <Input placeholder="REF-XXXX" value={formData.reference} onChange={e => setFormData(f => ({ ...f, reference: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Term</Label>
                <Select value={formData.termId} onValueChange={v => setFormData(f => ({ ...f, termId: v }))}>
                  <SelectTrigger className="w-full"><SelectValue placeholder="Select term" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="first">First Term</SelectItem>
                    <SelectItem value="second">Second Term</SelectItem>
                    <SelectItem value="third">Third Term</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={handleSubmit} disabled={submitting}>{submitting ? 'Recording...' : 'Record Payment'}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filter Buttons */}
      <div className="flex gap-2 flex-wrap">
        {statusFilters.map(filter => (
          <Button
            key={filter}
            variant={activeFilter === filter ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveFilter(filter)}
            className={cn(activeFilter === filter && 'pointer-events-none')}
          >
            {filter}
          </Button>
        ))}
      </div>

      {/* Data Table */}
      {loading ? (
        <TableSkeleton />
      ) : (
        <DataTable columns={columns} data={tableData} searchKey="studentName" searchPlaceholder="Search student..." />
      )}
    </div>
  );
}
