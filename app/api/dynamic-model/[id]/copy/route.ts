import { db } from "@/lib/db";
import { NextResponse } from "next/server";

// app/api/dynamic-model/[id]/copy/route.ts
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { newName } = await req.json();

  const original = await db.dynamicModel.findUnique({
    where: { id },
    include: { fields: true },
  });

  if (!original) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const copy = await db.dynamicModel.create({
    data: {
      name: newName,
      aId: original.aId,
      fields: {
        create: original.fields.map(f => ({
          label: f.label,
          key: f.key,
          type: f.type,
          options: f.options,
          required: f.required,
          refModelId: f.refModelId,
        })),
      },
    },
    include: { fields: true },
  });

  return NextResponse.json(copy);
}