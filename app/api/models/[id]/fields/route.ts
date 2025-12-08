import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }  // 注意：params 為 Promise
) {
  // 必須 await params
  const { id } = await context.params;

  const fields = await db.dynamicField.findMany({
    where: { dynamicModelId: id },
  });

  return NextResponse.json({ fields });
}