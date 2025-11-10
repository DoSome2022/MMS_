// app/api/models/[id]/data/route.ts
import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';


export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }  // ← 改為 Promise
) {
  const params = await context.params;  // ← 必須 await
  const { searchParams } = new URL(request.url);
  const parentId = searchParams.get('parentId');

  const data = await db.dynamicData.findMany({
    where: {
      dynamicModelId: params.id,
      parentId: parentId || null,
    },
    include: {
      children: {
        include: { children: { include: { children: true } } },
      },
    },
    orderBy: { createdAt: 'asc' },
  });

  return NextResponse.json(data);
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }  // ← 改為 Promise
) {
  const params = await context.params;  // ← 必須 await
  const body = await request.json();
  const { parentId, data } = body;

  const newData = await db.dynamicData.create({
    data: {
      dynamicModelId: params.id,
      parentId: parentId || null,
      data: data || {},
    },
  });

  return NextResponse.json(newData);
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }  // ← 改為 Promise
) {
  const params = await context.params;  // ← 必須 await
  const body = await request.json();
  const { id, data } = body;

  if (!id) {
    return NextResponse.json({ error: '缺少 id' }, { status: 400 });
  }

  const updated = await db.dynamicData.update({
    where: { id },
    data: { data },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }  // ← 改為 Promise
) {
  const params = await context.params;  // ← 必須 await
  const body = await request.json();
  const { id } = body;

  if (!id) {
    return NextResponse.json({ error: '缺少 id' }, { status: 400 });
  }

  const deleteRecursive = async (dataId: string) => {
    const children = await db.dynamicData.findMany({
      where: { parentId: dataId },
      select: { id: true },
    });

    for (const child of children) {
      await deleteRecursive(child.id);
    }

    await db.dynamicData.delete({ where: { id: dataId } });
  };

  await deleteRecursive(id);

  return NextResponse.json({ success: true });
}