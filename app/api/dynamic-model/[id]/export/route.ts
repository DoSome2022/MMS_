import { db } from "@/lib/db";
import { NextResponse } from "next/server";

// app/api/dynamic-model/[id]/export/route.ts
export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const model = await db.dynamicModel.findUnique({
    where: { id },
    include: { fields: { include: { refModel: true } }, dataRows: true },
  });

  return NextResponse.json(model);
}