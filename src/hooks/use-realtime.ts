'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { io, type Socket } from 'socket.io-client';
import { useRealtimeContext } from '@/components/shared/realtime-provider';

/**
 * Custom hook for WebSocket real-time communication via the Skoolar gateway.
 * Uses the shared RealtimeProvider connection if available, otherwise creates its own.
 *
 * Connection URL: io('/?XTransformPort=3003') — Caddy routes this to port 3003.
 */

export interface RealtimeState {
  isConnected: boolean;
  isReconnecting: boolean;
}

export function useRealtime() {
  // Try to use the shared context first
  const context = useRealtimeContext();
  
  // If context is available (provider is wrapping the app), use it
  if (context) {
    return {
      isConnected: context.isConnected,
      isReconnecting: context.isReconnecting,
      joinSchool: context.joinSchool,
      leaveSchool: context.leaveSchool,
      joinClass: context.joinClass,
      leaveClass: context.leaveClass,
      setUserOnline: context.setUserOnline,
      setUserOffline: () => {},
      sendNotification: () => {},
      markAttendance: () => {},
      publishExam: () => {},
      updateGrade: () => {},
      receivePayment: () => {},
      postAnnouncement: () => {},
      sendChatMessage: context.sendChatMessage,
      sendTypingIndicator: context.sendTypingIndicator,
      emit: context.emit,
      on: context.on,
      off: () => {},
    };
  }

  // Fallback: create own connection (legacy behavior for components outside provider)
  const socketRef = useRef<Socket | null>(null);
  const [state, setState] = useState<RealtimeState>({
    isConnected: false,
    isReconnecting: false,
  });

  useEffect(() => {
    const socket = io('/?XTransformPort=3003', {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('[Realtime] Connected:', socket.id);
      setState({ isConnected: true, isReconnecting: false });
    });

    socket.on('disconnect', (reason) => {
      console.log('[Realtime] Disconnected:', reason);
      setState((prev) => ({ ...prev, isConnected: false }));
    });

    socket.on('connect_error', (error) => {
      console.error('[Realtime] Connection error:', error.message);
    });

    socket.on('reconnect_attempt', (attempt) => {
      console.log('[Realtime] Reconnection attempt:', attempt);
      setState((prev) => ({ ...prev, isReconnecting: true }));
    });

    socket.on('reconnect', (attemptNumber) => {
      console.log('[Realtime] Reconnected after', attemptNumber, 'attempts');
      setState({ isConnected: true, isReconnecting: false });
    });

    socket.on('reconnect_failed', () => {
      console.error('[Realtime] Reconnection failed');
      setState({ isConnected: false, isReconnecting: false });
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  // ─── Room management ─────────────────────────────────────────────

  const joinSchool = useCallback((schoolId: string) => {
    socketRef.current?.emit('join-school', { schoolId });
  }, []);

  const leaveSchool = useCallback((schoolId: string) => {
    socketRef.current?.emit('leave-school', { schoolId });
  }, []);

  const joinClass = useCallback((schoolId: string, classId: string) => {
    socketRef.current?.emit('join-class', { schoolId, classId });
  }, []);

  const leaveClass = useCallback((schoolId: string, classId: string) => {
    socketRef.current?.emit('leave-class', { schoolId, classId });
  }, []);

  // ─── Presence ────────────────────────────────────────────────────

  const setUserOnline = useCallback(
    (schoolId: string, userId: string, userName: string) => {
      socketRef.current?.emit('user-online', { schoolId, userId, userName });
    },
    [],
  );

  const setUserOffline = useCallback(() => {
    socketRef.current?.emit('user-offline');
  }, []);

  // ─── Notifications ───────────────────────────────────────────────

  const sendNotification = useCallback(
    (
      data: {
        schoolId: string;
        title: string;
        message: string;
        type?: string;
        category?: string;
      },
    ) => {
      socketRef.current?.emit('send-notification', data);
    },
    [],
  );

  // ─── Attendance ──────────────────────────────────────────────────

  const markAttendance = useCallback(
    (data: { schoolId: string; classId: string; studentId: string; status: string; date?: string }) => {
      socketRef.current?.emit('attendance-marked', data);
    },
    [],
  );

  // ─── Exams ───────────────────────────────────────────────────────

  const publishExam = useCallback(
    (data: { schoolId: string; classId: string; subjectId: string; examName: string }) => {
      socketRef.current?.emit('exam-published', data);
    },
    [],
  );

  // ─── Grades ──────────────────────────────────────────────────────

  const updateGrade = useCallback(
    (data: { schoolId: string; classId: string; studentId: string; subject: string; score: number }) => {
      socketRef.current?.emit('grade-updated', data);
    },
    [],
  );

  // ─── Payments ────────────────────────────────────────────────────

  const receivePayment = useCallback(
    (data: { schoolId: string; studentId: string; amount: number; currency?: string }) => {
      socketRef.current?.emit('payment-received', data);
    },
    [],
  );

  // ─── Announcements ───────────────────────────────────────────────

  const postAnnouncement = useCallback(
    (data: { schoolId: string; title: string; type?: string; priority?: string }) => {
      socketRef.current?.emit('announcement-posted', data);
    },
    [],
  );

  // ─── Chat ────────────────────────────────────────────────────────

  const sendChatMessage = useCallback(
    (data: { schoolId: string; toUserId: string; fromUserId: string; message: string }) => {
      socketRef.current?.emit('chat-message', data);
    },
    [],
  );

  const sendTypingIndicator = useCallback(
    (data: { schoolId: string; toUserId: string; fromUserId: string }) => {
      socketRef.current?.emit('typing', data);
    },
    [],
  );

  // ─── Generic emitter / listener ──────────────────────────────────

  const emit = useCallback((event: string, data: unknown) => {
    socketRef.current?.emit(event, data);
  }, []);

  const on = useCallback(
    (event: string, callback: (...args: unknown[]) => void) => {
      const handler = (...args: unknown[]) => callback(...args);
      socketRef.current?.on(event, handler);
      return () => {
        socketRef.current?.off(event, handler);
      };
    },
    [],
  );

  const off = useCallback((event: string, callback?: (...args: unknown[]) => void) => {
    if (callback) {
      socketRef.current?.off(event, callback);
    } else {
      socketRef.current?.removeAllListeners(event);
    }
  }, []);

  return {
    isConnected: state.isConnected,
    isReconnecting: state.isReconnecting,
    // Room management
    joinSchool,
    leaveSchool,
    joinClass,
    leaveClass,
    // Presence
    setUserOnline,
    setUserOffline,
    // Notifications
    sendNotification,
    // Attendance
    markAttendance,
    // Exams
    publishExam,
    // Grades
    updateGrade,
    // Payments
    receivePayment,
    // Announcements
    postAnnouncement,
    // Chat
    sendChatMessage,
    sendTypingIndicator,
    // Generic
    emit,
    on,
    off,
  };
}
