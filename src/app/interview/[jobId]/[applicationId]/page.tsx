'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Send, Loader2, Building2, Briefcase, Clock, ArrowLeft, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface InterviewMessage {
  id: string;
  senderName: string;
  content: string;
  isFromAdmin: boolean;
  createdAt: string;
}

interface InterviewData {
  messages: InterviewMessage[];
  application: {
    id: string;
    status: string;
    applicantName: string;
    jobTitle: string;
    school: { id: string; name: string; logo: string | null; primaryColor: string };
  };
}

const statusConfig: Record<string, { label: string; color: string }> = {
  pending: { label: 'Pending', color: '#6b7280' },
  reviewed: { label: 'Reviewed', color: '#3b82f6' },
  interview_scheduled: { label: 'Interview Scheduled', color: '#8b5cf6' },
  interviewed: { label: 'Interviewed', color: '#f59e0b' },
  offered: { label: 'Offered', color: '#10b981' },
  hired: { label: 'Hired', color: '#059448' },
  rejected: { label: 'Rejected', color: '#dc2626' },
  withdrawn: { label: 'Withdrawn', color: '#6b7280' },
};

export default function InterviewPage({ params }: { params: Promise<{ jobId: string; applicationId: string }> }) {
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<InterviewData | null>(null);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [authChecking, setAuthChecking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    params.then(p => setApplicationId(p.applicationId));
  }, [params]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (data?.messages) scrollToBottom();
  }, [data?.messages]);

  const fetchMessages = async () => {
    if (!applicationId || !email) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/public/interview/${applicationId}?email=${encodeURIComponent(email)}`);
      const json = await res.json();
      if (json.data) {
        setData(json.data);
        setAuthenticated(true);
      } else {
        toast.error(json.error || 'Failed to load interview');
      }
    } catch {
      toast.error('Failed to connect. Check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleAuthenticate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error('Please enter your email');
      return;
    }
    setAuthChecking(true);
    await fetchMessages();
    setAuthChecking(false);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !applicationId || !email) return;
    setSending(true);
    try {
      const res = await fetch(`/api/public/interview/${applicationId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, content: message.trim() }),
      });
      const json = await res.json();
      if (json.data) {
        setMessage('');
        fetchMessages();
      } else {
        toast.error(json.error || 'Failed to send');
      }
    } catch {
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center mx-auto mb-4">
              <Briefcase className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-xl">Interview Portal</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Enter your email to access your interview conversation
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAuthenticate} className="space-y-4">
              <Input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="h-11"
                required
              />
              <Button type="submit" className="w-full h-11" disabled={authChecking}>
                {authChecking ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                {authChecking ? 'Verifying...' : 'Access Interview'}
              </Button>
            </form>
            {loading && !authChecking && (
              <p className="text-xs text-red-500 mt-2 text-center">
                Could not verify. Check your email and try again.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const statusInfo = statusConfig[data.application.status] || { label: data.application.status, color: '#6b7280' };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex flex-col">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => window.location.href = '/'}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="font-semibold text-sm truncate">{data.application.jobTitle}</h1>
              <Badge style={{ backgroundColor: statusInfo.color + '20', color: statusInfo.color }} className="text-xs shrink-0">
                {statusInfo.label}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Building2 className="h-3 w-3" /> {data.application.school.name}
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 max-w-4xl mx-auto w-full p-4 overflow-y-auto">
        <div className="space-y-4">
          {data.messages.length === 0 && (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <Briefcase className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">No messages yet</h3>
              <p className="text-sm text-muted-foreground">
                Messages from the school will appear here. You can send a message below.
              </p>
            </div>
          )}

          {data.messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.isFromAdmin ? 'justify-start' : 'justify-end'}`}>
              <div className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                msg.isFromAdmin
                  ? 'bg-gray-100 text-gray-900 rounded-tl-sm'
                  : 'bg-purple-600 text-white rounded-tr-sm'
              }`}>
                <div className="flex items-center gap-1.5 mb-1">
                  {msg.isFromAdmin ? (
                    <Shield className="h-3 w-3 text-purple-500" />
                  ) : null}
                  <span className={`text-xs font-medium ${msg.isFromAdmin ? 'text-purple-600' : 'text-purple-200'}`}>
                    {msg.isFromAdmin ? msg.senderName : 'You'}
                  </span>
                </div>
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                <p className={`text-[10px] mt-1 ${msg.isFromAdmin ? 'text-gray-400' : 'text-purple-200'}`}>
                  {formatTime(msg.createdAt)}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="border-t bg-white sticky bottom-0">
        <div className="max-w-4xl mx-auto p-4">
          <form onSubmit={handleSend} className="flex gap-2">
            <Input
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 h-11"
              disabled={sending}
            />
            <Button type="submit" size="icon" className="h-11 w-11 shrink-0" disabled={sending || !message.trim()}>
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
