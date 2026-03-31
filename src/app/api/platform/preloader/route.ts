import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

// GET /api/platform/preloader - Public: fetch random active quote
export async function GET() {
  try {
    const quotes = await db.preloaderQuote.findMany({
      where: { isActive: true },
    });

    if (quotes.length === 0) {
      return NextResponse.json({
        success: true,
        data: { quote: 'Education is the passport to the future.', author: 'Malcolm X' },
      });
    }

    const randomIndex = Math.floor(Math.random() * quotes.length);
    return NextResponse.json({ success: true, data: quotes[randomIndex] });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

// POST /api/platform/preloader - Super Admin: create quote
export async function POST(request: NextRequest) {
  try {
    const token = await getToken({ req: request });
    if (!token || token.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const { quote, author, isActive } = body;

    if (!quote || !author) {
      return NextResponse.json({ success: false, message: 'Quote and author are required' }, { status: 400 });
    }

    const newQuote = await db.preloaderQuote.create({
      data: {
        quote,
        author,
        isActive: isActive !== undefined ? isActive : true,
      },
    });

    return NextResponse.json({ success: true, data: newQuote, message: 'Quote created' }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
