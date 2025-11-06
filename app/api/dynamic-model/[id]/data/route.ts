// app/api/dynamic-model/[id]/data/route.ts
import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: modelId } = await params;

  try {
    const body = await req.json();
    const { parentId, ...data } = body;

    const row = await db.dynamicData.create({
      data: {
        dynamicModelId: modelId,
        data: data as any,
        parentId: parentId || null,
      },
    });

    return NextResponse.json(row, { status: 201 });
  } catch (error: any) {
    console.error('Create data error:', error);
    return NextResponse.json(
      { error: 'Failed', details: error.message },
      { status: 500 }
    );
  }
}