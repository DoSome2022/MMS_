// app/api/dynamic-data/[modelId]/route.ts
import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ modelId: string }> }
) {
  const { modelId } = await params;
  const { searchParams } = new URL(req.url);
  const parentId = searchParams.get('parentId') || null;

  try {
    const data = await db.dynamicData.findMany({
      where: {
        dynamicModelId: modelId,
        parentId,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error('GET dynamic-data error:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}