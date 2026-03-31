'use client';

import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
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
import { Plus, Send, Mail, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface Message {
  id: string;
  from: string;
  subject: string;
  preview: string;
  body: string;
  time: string;
  unread: boolean;
  avatarColor: string;
}

const messages: Message[] = [
  {
    id: 'msg-1',
    from: 'Mrs. Adebayo Funke',
    subject: 'JSS 1A CA2 Results',
    preview: 'I have uploaded the CA2 results for JSS 1A Mathematics...',
    body: 'Hello Admin,\n\nI have uploaded the CA2 results for JSS 1A Mathematics. Please review and approve when ready.\n\nTotal students: 45\nAverage score: 72%\n\nBest regards,\nMrs. Adebayo',
    time: '10 min ago',
    unread: true,
    avatarColor: 'bg-emerald-500',
  },
  {
    id: 'msg-2',
    from: 'Mr. Garba Abdul',
    subject: 'Computer Lab Request',
    preview: 'We need to schedule the computer lab for SS 2A practical exam...',
    body: 'Hello,\n\nWe need to schedule the computer lab for SS 2A practical exam next week Tuesday. Please confirm availability.\n\nThanks,\nMr. Garba',
    time: '1 hour ago',
    unread: true,
    avatarColor: 'bg-blue-500',
  },
  {
    id: 'msg-3',
    from: 'Bursar Office',
    subject: 'Fee Collection Update',
    preview: 'Second term fee collection is now at 72%...',
    body: 'Dear Admin,\n\nSecond term fee collection update:\n\n- Total expected: ₦45,600,000\n- Collected: ₦32,800,000 (72%)\n- Pending: ₦12,800,000\n\nPlease follow up on outstanding payments.\n\nRegards,\nBursar Office',
    time: '3 hours ago',
    unread: false,
    avatarColor: 'bg-amber-500',
  },
  {
    id: 'msg-4',
    from: 'Parent - Mr. Johnson',
    subject: 'Adewale Attendance Concern',
    preview: 'I noticed my son has been absent twice this week...',
    body: 'Dear Sir/Madam,\n\nI noticed my son Adewale Johnson has been marked absent twice this week. I would like to understand the situation.\n\nPlease provide more details.\n\nThank you,\nMr. Johnson',
    time: 'Yesterday',
    unread: false,
    avatarColor: 'bg-violet-500',
  },
  {
    id: 'msg-5',
    from: 'Dr. Ishaq Mohammed',
    subject: 'Physics Practical Materials',
    preview: 'We need to order more physics lab materials for the term...',
    body: 'Hello,\n\nWe need to order more physics lab materials for the upcoming practical exams. The current stock is running low.\n\nEstimated cost: ₦150,000\n\nPlease approve the purchase.\n\nDr. Ishaq',
    time: '2 days ago',
    unread: false,
    avatarColor: 'bg-pink-500',
  },
];

function getInitials(name: string) {
  return name.split(' ').filter(w => w.length > 1).map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

export function CommunicationView() {
  const [selectedMessage, setSelectedMessage] = React.useState<Message | null>(null);
  const [replyText, setReplyText] = React.useState('');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [newMsgOpen, setNewMsgOpen] = React.useState(false);

  const filtered = messages.filter(m =>
    m.from.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Mail className="size-5" />
            Communication
          </h2>
          <p className="text-sm text-muted-foreground">
            {messages.filter(m => m.unread).length} unread messages
          </p>
        </div>
        <Dialog open={newMsgOpen} onOpenChange={setNewMsgOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="size-4" />
              New Message
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New Message</DialogTitle>
              <DialogDescription>Send a message to a recipient.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Recipient</Label>
                <Select>
                  <SelectTrigger><SelectValue placeholder="Select recipient" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-teachers">All Teachers</SelectItem>
                    <SelectItem value="all-parents">All Parents</SelectItem>
                    <SelectItem value="tch-1">Mrs. Adebayo Funke</SelectItem>
                    <SelectItem value="tch-3">Dr. Ishaq Mohammed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Subject</Label>
                <Input placeholder="Message subject" />
              </div>
              <div className="grid gap-2">
                <Label>Message</Label>
                <Textarea placeholder="Write your message..." rows={5} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setNewMsgOpen(false)}>Cancel</Button>
              <Button className="gap-2" onClick={() => { setNewMsgOpen(false); toast.success('Message sent successfully'); }}>
                <Send className="size-4" />
                Send Message
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 lg:grid-cols-5 min-h-[500px]">
        <Card className="lg:col-span-2 p-0">
          <div className="p-3 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Search messages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          <ScrollArea className="h-[450px]">
            {filtered.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  'p-3 cursor-pointer hover:bg-muted/50 border-b transition-colors',
                  selectedMessage?.id === msg.id && 'bg-muted',
                )}
                onClick={() => setSelectedMessage(msg)}
              >
                <div className="flex items-start gap-3">
                  <div className={cn('flex size-9 shrink-0 items-center justify-center rounded-full text-white text-xs font-bold', msg.avatarColor)}>
                    {getInitials(msg.from)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className={cn('text-sm truncate', msg.unread && 'font-semibold')}>
                        {msg.from}
                      </span>
                      <span className="text-[10px] text-muted-foreground shrink-0">{msg.time}</span>
                    </div>
                    <p className={cn('text-xs truncate mt-0.5', msg.unread ? 'text-foreground' : 'text-muted-foreground')}>
                      {msg.subject}
                    </p>
                    <p className="text-[11px] text-muted-foreground truncate mt-0.5">{msg.preview}</p>
                  </div>
                  {msg.unread && (
                    <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 mt-2" />
                  )}
                </div>
              </div>
            ))}
          </ScrollArea>
        </Card>

        <Card className="lg:col-span-3 p-0">
          {selectedMessage ? (
            <div className="flex flex-col h-full">
              <div className="p-4 border-b">
                <div className="flex items-start gap-3">
                  <div className={cn('flex size-10 shrink-0 items-center justify-center rounded-full text-white font-bold text-sm', selectedMessage.avatarColor)}>
                    {getInitials(selectedMessage.from)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm">{selectedMessage.subject}</h3>
                    <p className="text-xs text-muted-foreground">
                      From: {selectedMessage.from} &middot; {selectedMessage.time}
                    </p>
                  </div>
                  {selectedMessage.unread && (
                    <Badge className="bg-emerald-100 text-emerald-700 text-[10px]">New</Badge>
                  )}
                </div>
              </div>
              <ScrollArea className="flex-1 p-4">
                <div className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
                  {selectedMessage.body}
                </div>
              </ScrollArea>
              <div className="p-4 border-t">
                <div className="flex items-center gap-2">
                  <Textarea
                    placeholder="Type your reply..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="flex-1 min-h-[60px]"
                    rows={2}
                  />
                  <Button size="icon" className="shrink-0 self-end" onClick={() => { setReplyText(''); toast.success('Reply sent'); }}>
                    <Send className="size-4" />
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full py-12 text-muted-foreground">
              <Mail className="size-10 opacity-40" />
              <p className="mt-2 text-sm">Select a message to read</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
