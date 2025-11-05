// app/api/dynamic-model/route.ts
import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { name, aId } = await req.json();

    if (!name || !aId) {
      return NextResponse.json({ error: 'Missing name or aId' }, { status: 400 });
    }

    const model = await db.dynamicModel.create({
      data: {
        name,
        aId,
      },
    });

    return NextResponse.json(model, { status: 201 });
  } catch (error) {
    console.error('POST /api/dynamic-model error:', error);
    return NextResponse.json({ error: 'Failed to create model' }, { status: 500 });
  }
}