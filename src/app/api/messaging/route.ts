import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-middleware';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action') || '';

  try {
    switch (action) {
      case 'conversations': {
        const userId = searchParams.get('userId') || '';
        const schoolId = searchParams.get('schoolId') || '';
        if (!userId || !schoolId) return NextResponse.json({ success: false, message: 'Missing params' }, { status: 400 });

        const conversations = await db.conversation.findMany({
          where: {
            schoolId,
            participantIds: { contains: userId },
          },
          orderBy: { lastMessageAt: 'desc' },
        });

        const enriched = await Promise.all(conversations.map(async (conv) => {
          const lastMsg = await db.message.findFirst({
            where: { conversationId: conv.id },
            orderBy: { createdAt: 'desc' },
          });
          const unreadCount = await db.message.count({
            where: { conversationId: conv.id, isRead: false, senderId: { not: userId } },
          });
          const participants = JSON.parse(conv.participantIds || '[]') as string[];
          const participantUsers = await db.user.findMany({
            where: { id: { in: participants } },
            select: { id: true, name: true, avatar: true, role: true },
          });
          return {
            ...conv,
            participants: participantUsers,
            lastMessage: lastMsg?.content || null,
            lastMessageType: lastMsg?.type || null,
            lastMessageAt: lastMsg?.createdAt || conv.lastMessageAt,
            unreadCount,
          };
        }));

        return NextResponse.json({ success: true, data: enriched });
      }

      case 'messages': {
        const conversationId = searchParams.get('conversationId') || '';
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '50');
        if (!conversationId) return NextResponse.json({ success: false, message: 'conversationId required' }, { status: 400 });

        const [messages, total] = await Promise.all([
          db.message.findMany({
            where: { conversationId },
            orderBy: { createdAt: 'asc' },
            skip: (page - 1) * limit,
            take: limit,
          }),
          db.message.count({ where: { conversationId } }),
        ]);

        // Enrich with sender info
        const enriched = await Promise.all(messages.map(async (msg) => {
          const sender = await db.user.findUnique({
            where: { id: msg.senderId },
            select: { name: true, avatar: true, role: true },
          });
          return { ...msg, sender };
        }));

        return NextResponse.json({
          success: true,
          data: enriched,
          pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
        });
      }

      case 'search-users': {
        const schoolId = searchParams.get('schoolId') || '';
        const query = searchParams.get('query') || '';
        const role = searchParams.get('role') || '';
        if (!schoolId) return NextResponse.json({ success: false, message: 'schoolId required' }, { status: 400 });

        const where: Record<string, unknown> = { schoolId, isActive: true };
        if (query) {
          (where as Record<string, unknown>).user = { name: { contains: query } };
        }
        if (role) {
          (where as Record<string, string>).role = role;
        }

        // Search across students, teachers, parents
        const [students, teachers, parents] = await Promise.all([
          db.student.findMany({
            where: { schoolId, isActive: true, user: query ? { name: { contains: query } } : undefined },
            include: { user: { select: { id: true, name: true, avatar: true } }, class: { select: { name: true } } },
            take: 10,
          }),
          db.teacher.findMany({
            where: { schoolId, isActive: true, user: query ? { name: { contains: query } } : undefined },
            include: { user: { select: { id: true, name: true, avatar: true } } },
            take: 10,
          }),
          db.parent.findMany({
            where: { schoolId, user: query ? { name: { contains: query } } : undefined },
            include: { user: { select: { id: true, name: true, avatar: true } } },
            take: 10,
          }),
        ]);

        const users = [
          ...students.map(s => ({ ...s.user, role: 'STUDENT', meta: s.class?.name })),
          ...teachers.map(t => ({ ...t.user, role: 'TEACHER', meta: t.specialization })),
          ...parents.map(p => ({ ...p.user, role: 'PARENT', meta: null })),
        ];

        return NextResponse.json({ success: true, data: users });
      }

      default:
        return NextResponse.json({ success: false, message: 'Invalid action' }, { status: 400 });
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action') || '';
  const body = await request.json().catch(() => ({}));

  try {
    switch (action) {
      case 'create-conversation': {
        const { schoolId, participantIds, type, title, createdBy } = body;
        if (!schoolId || !participantIds || participantIds.length < 2) {
          return NextResponse.json({ success: false, message: 'schoolId and at least 2 participants required' }, { status: 400 });
        }
        // Check if direct conversation already exists between these users
        if (type === 'direct') {
          const sorted = [...participantIds].sort();
          const existing = await db.conversation.findFirst({
            where: { schoolId, type: 'direct', participantIds: { contains: sorted[0] } },
          });
          if (existing) {
            const parts = JSON.parse(existing.participantIds || '[]') as string[];
            if (parts.sort().join(',') === sorted.join(',')) {
              return NextResponse.json({ success: true, data: existing });
            }
          }
        }
        const conversation = await db.conversation.create({
          data: {
            schoolId,
            type: type || 'direct',
            title: title || null,
            participantIds: JSON.stringify(participantIds),
            createdBy: createdBy || null,
          },
        });
        return NextResponse.json({ success: true, data: conversation }, { status: 201 });
      }

      case 'send-message': {
        const { conversationId, senderId, schoolId, content, type } = body;
        if (!conversationId || !senderId || !content) {
          return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 });
        }
        const conversation = await db.conversation.findUnique({ where: { id: conversationId } });
        if (!conversation) return NextResponse.json({ success: false, message: 'Conversation not found' }, { status: 404 });

        const message = await db.message.create({
          data: {
            conversationId,
            schoolId: schoolId || conversation.schoolId,
            senderId,
            content: String(content).slice(0, 10000),
            type: type || 'text',
          },
        });

        // Update conversation last message
        await db.conversation.update({
          where: { id: conversationId },
          data: { lastMessage: String(content).slice(0, 100), lastMessageAt: new Date() },
        });

        const sender = await db.user.findUnique({
          where: { id: senderId },
          select: { name: true, avatar: true, role: true },
        });

        return NextResponse.json({ success: true, data: { ...message, sender } }, { status: 201 });
      }

      case 'mark-read': {
        const { conversationId, userId } = body;
        if (!conversationId || !userId) return NextResponse.json({ success: false, message: 'Missing fields' }, { status: 400 });

        await db.message.updateMany({
          where: { conversationId, senderId: { not: userId }, isRead: false },
          data: { isRead: true },
        });

        return NextResponse.json({ success: true, message: 'Messages marked as read' });
      }

      default:
        return NextResponse.json({ success: false, message: 'Invalid action' }, { status: 400 });
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
