// app/api/a/[id]/route.ts
import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // 正確！直接 await Promise
  const { id } = await params;

  const a = await db.a.findUnique({
    where: { id },
    include: {
      dynamicModels: {
        include: {
          fields: { orderBy: { createdAt: 'asc' } },
          dataRows: { orderBy: { createdAt: 'asc' } },
        },
      },
    },
  });

  if (!a) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json(a);
}