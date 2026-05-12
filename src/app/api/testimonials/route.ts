import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-middleware';

// GET /api/testimonials - Public: returns approved testimonials. Admin: ?all=true returns all.
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const showAll = searchParams.get('all') === 'true';

    if (showAll) {
      const auth = await requireAuth(request);
      if (auth instanceof NextResponse) return auth;
      if (auth.role !== 'SUPER_ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      }
    }

    const testimonials = await db.testimonial.findMany({
      where: showAll ? {} : { isApproved: true },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    });

    return NextResponse.json({ data: testimonials });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST /api/testimonials - Public: user submits review. Admin: creates with isApproved.
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, role, schoolName, content, rating, avatar, isApproved: reqApproved } = body;

    if (!name || !content) {
      return NextResponse.json({ error: 'Name and review content are required' }, { status: 400 });
    }

    const auth = await requireAuth(request);
    const isAdmin = !(auth instanceof NextResponse) && auth.role === 'SUPER_ADMIN';

    const testimonial = await db.testimonial.create({
      data: {
        name,
        role: role || null,
        schoolName: schoolName || null,
        content,
        rating: rating && rating >= 1 && rating <= 5 ? rating : 5,
        avatar: avatar || null,
        isApproved: isAdmin ? (reqApproved !== undefined ? reqApproved : true) : false,
      },
    });

    return NextResponse.json(
      { data: testimonial, message: isAdmin ? 'Review created' : 'Thank you! Your review will be reviewed by the admin.' },
      { status: isAdmin ? 201 : 201 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// PUT /api/testimonials - SUPER_ADMIN only: update testimonial (approve, edit, reorder)
export async function PUT(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (auth instanceof NextResponse) return auth;
    if (auth.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Testimonial ID is required' }, { status: 400 });
    }

    const body = await request.json();
    const { name, role, schoolName, content, rating, avatar, isApproved, sortOrder } = body;

    const testimonial = await db.testimonial.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(role !== undefined && { role }),
        ...(schoolName !== undefined && { schoolName }),
        ...(content !== undefined && { content }),
        ...(rating !== undefined && { rating }),
        ...(avatar !== undefined && { avatar }),
        ...(isApproved !== undefined && { isApproved }),
        ...(sortOrder !== undefined && { sortOrder }),
      },
    });

    return NextResponse.json({ data: testimonial, message: 'Testimonial updated' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// DELETE /api/testimonials - SUPER_ADMIN only
export async function DELETE(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (auth instanceof NextResponse) return auth;
    if (auth.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Testimonial ID is required' }, { status: 400 });
    }

    await db.testimonial.delete({ where: { id } });

    return NextResponse.json({ message: 'Testimonial deleted' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
