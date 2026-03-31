import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { deleteFile, isStorageConfigured } from '@/lib/r2-storage';

// DELETE /api/upload/[key] — Delete a file from R2
// Uses native R2 binding on Cloudflare. Falls back to S3 API locally.

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    if (!isStorageConfigured()) {
      return NextResponse.json({ success: false, message: 'Cloud storage is not configured.' }, { status: 503 });
    }

    const token = await getToken({ req: request });
    if (!token || !token.id) {
      return NextResponse.json({ success: false, message: 'Authentication required' }, { status: 401 });
    }

    const { key } = await params;
    const decodedKey = decodeURIComponent(key);

    if (!decodedKey || decodedKey.includes('..') || decodedKey.startsWith('/')) {
      return NextResponse.json({ success: false, message: 'Invalid file key' }, { status: 400 });
    }

    const result = await deleteFile(decodedKey);
    if (!result.success) {
      return NextResponse.json({ success: false, message: result.error }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'File deleted successfully', data: { key: decodedKey } });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Delete failed';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
