// app/api/a/route.ts
import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, desc, category, price, image } = body;

    const a = await db.a.create({
      data: {
        title,
        desc: desc || '',
        category,
        price: parseFloat(price),
        image: image || null,
      },
    });

    return NextResponse.json(a, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: '建立失敗' }, { status: 500 });
  }
}