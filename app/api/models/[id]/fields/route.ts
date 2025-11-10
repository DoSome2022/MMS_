import { db } from '@/lib/db';
import { NextResponse } from 'next/server';


export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const fields = await db.dynamicField.findMany({
    where: { dynamicModelId: params.id },
  });
  return NextResponse.json({ fields });
}