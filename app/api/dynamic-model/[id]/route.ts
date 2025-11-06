import { db } from "@/lib/db";
import { NextResponse } from "next/server";

// app/api/dynamic-model/[id]/route.ts
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }  // 注意這裡是 Promise！
) {
  const { id } = await params; // 加上 await！
  
  try {
    const model = await db.dynamicModel.findUnique({
      where: { id },
      include: {
        fields: { orderBy: { createdAt: 'asc' } },
        dataRows: { orderBy: { createdAt: 'desc' } },
      },
    });

    if (!model) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(model);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}