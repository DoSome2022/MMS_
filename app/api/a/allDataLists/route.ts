// app/api/a/allDataLists/route.ts
import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const a = await db.a.findMany({
      select: {
        id: true,
        title: true,
        desc: true,
        price: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // 明確回傳陣列（即使空）
    return NextResponse.json(a || []);
  } catch (error: any) {
    console.error('GET /api/a/allDataLists error:', error);

    if (error.code === 'P2021') {
      return NextResponse.json({ error: 'Table A does not exist. Run `npx prisma db push`' }, { status: 500 });
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}