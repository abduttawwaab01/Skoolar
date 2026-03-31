---
## Task ID: 5 - realtime-websocket
### Work Task
Build a WebSocket real-time notification service for the Skoolar platform, including a Socket.IO mini-service, React hook, context provider, and app integration.

### Work Summary

**1. WebSocket Mini Service (`mini-services/realtime-service/`)**

Created a complete Socket.IO server on port 3003 with the following architecture:

- **`package.json`** — Dependencies: socket.io 4.8.3, cors 2.8.6
- **`index.ts`** — Full-featured real-time server using `createServer` + `Server` pattern with `path: '/'` for Caddy gateway compatibility

**Server event handlers implemented:**
- `connection` / `disconnect` — Lifecycle logging + cleanup
- `join-school` / `leave-school` — School room management
- `join-class` / `leave-class` — Class room management
- `send-notification` — Broadcasts to school room, emits ack to sender
- `attendance-marked` — Broadcasts to class room
- `exam-published` — Broadcasts to both school room and class room
- `grade-updated` — Broadcasts to student room + class room
- `payment-received` — Broadcasts to student room + school room
- `announcement-posted` — Broadcasts to school room with priority/type
- `chat-message` — Targeted DM via user rooms (both sender + recipient)
- `typing` — Typing indicator to recipient only
- `user-online` / `user-offline` — Presence tracking with auto-join personal room

**Room naming convention:** `school:{id}`, `school:{id}:class:{id}`, `school:{id}:user:{id}`, `school:{id}:student:{id}`

Graceful shutdown via SIGTERM/SIGINT handlers.

**2. React Hook (`src/hooks/use-realtime.ts`)**

Custom hook providing:
- Auto-connecting Socket.IO client via `io('/?XTransformPort=3003')`
- Connection state tracking (isConnected, isReconnecting)
- Room management: joinSchool, leaveSchool, joinClass, leaveClass
- Presence: setUserOnline, setUserOffline
- Domain events: sendNotification, markAttendance, publishExam, updateGrade, receivePayment, postAnnouncement
- Chat: sendChatMessage, sendTypingIndicator
- Generic: emit, on, off

**3. Realtime Context Provider (`src/components/shared/realtime-provider.tsx`)**

React context provider wrapping the entire app:
- Manages single WebSocket connection instance
- Auto-joins current school room when user switches schools
- Accumulates notifications (max 100) with unread count tracking
- Shows toast notifications for: exam published, grade updated, payment received, announcements, chat messages
- Exposes `useRealtimeContext()` hook for all components
- Uses stable ref pattern for notification handler to avoid closure issues

**4. App Integration (`src/app/page.tsx`)**

Wired `RealtimeProvider` inside `SessionProvider`, wrapping `AuthGate` and `Toaster`.

**5. Dependencies Installed**

- Mini service: `socket.io@4.8.3`, `cors@2.8.6`
- Frontend: `socket.io-client@4.8.3`

**6. Mini Service Status**

Running on port 3003, accessible via gateway at `/?XTransformPort=3003`.

**Lint Result:** 0 errors, 1 pre-existing warning (TanStack Table incompatible library)

### Files Created:
- `/home/z/my-project/mini-services/realtime-service/package.json`
- `/home/z/my-project/mini-services/realtime-service/index.ts`
- `/home/z/my-project/src/hooks/use-realtime.ts`
- `/home/z/my-project/src/components/shared/realtime-provider.tsx`

### Files Modified:
- `/home/z/my-project/src/app/page.tsx` — Added RealtimeProvider wrapping
- `/home/z/my-project/package.json` — Added socket.io-client dependency

### Commands Run:
- `cd /home/z/my-project/mini-services/realtime-service && bun add socket.io cors`
- `cd /home/z/my-project && bun add socket.io-client`
- `cd /home/z/my-project/mini-services/realtime-service && bun run dev` (started on port 3003)
