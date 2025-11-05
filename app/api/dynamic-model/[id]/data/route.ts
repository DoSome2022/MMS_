// app/api/dynamic-model/[id]/data/route.ts
import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;  // 正確取得 id
  const body = await req.json();

  // 驗證 id 是否存在
  if (!id) {
    return NextResponse.json({ error: 'Model ID is required' }, { status: 400 });
  }

  try {
    const row = await db.dynamicData.create({
      data: {
        dynamicModelId: id,  // 確保傳入正確 id
        data: body,          // body 就是 { key: value }
      },
    });

    return NextResponse.json(row, { status: 201 });
  } catch (error: any) {
    console.error('POST /dynamic-model/[id]/data error:', error);

    if (error.code === 'P2003') {
      return NextResponse.json({ error: 'Invalid model ID' }, { status: 400 });
    }

    return NextResponse.json({ error: 'Failed to create data' }, { status: 500 });
  }
}