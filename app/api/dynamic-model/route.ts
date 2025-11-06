// app/api/dynamic-model/route.ts
import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { Prisma } from '@prisma/client'; // 關鍵：匯入 Prisma

const createSchema = z.object({
  name: z.string().min(1),
  aId: z.string().uuid(),
  fields: z
    .array(
      z.object({
        label: z.string().min(1),
        key: z.string().regex(/^[a-zA-Z0-9_]+$/),
        type: z.enum(['text', 'number', 'select', 'boolean']),
        options: z.array(z.string()).optional(),
        required: z.boolean().optional(),
      })
    )
    .optional()
    .default([]),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = createSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid data', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { name, aId, fields } = parsed.data;

    const model = await db.$transaction(async (tx) => {
      const model = await tx.dynamicModel.create({
        data: { name, aId },
      });

      if (fields.length > 0) {
        await tx.dynamicField.createMany({
          data: fields.map((f) => ({
            dynamicModelId: model.id,
            label: f.label,
            key: f.key,
            type: f.type,
            // 關鍵修正：用 Prisma.JsonNull 或 undefined
            options:
              f.type === 'select' && f.options && f.options.length > 0
                ? f.options
                : Prisma.JsonNull,
            required: f.required ?? false,
          })),
        });
      }

      return model;
    });

    return NextResponse.json(model, { status: 201 });
  } catch (error: any) {
    console.error('POST /api/dynamic-model error:', error);
    return NextResponse.json(
      { error: 'Failed to create model', details: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const { id, fields } = await req.json();

    if (!id || !Array.isArray(fields)) {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
    }

    await db.$transaction(async (tx) => {
      await tx.dynamicField.deleteMany({
        where: { dynamicModelId: id },
      });

      await tx.dynamicField.createMany({
        data: fields.map((f: any) => ({
          id: f.id,
          dynamicModelId: id,
          label: f.label,
          key: f.key,
          type: f.type,
          options:
            f.type === 'select' && f.options && f.options.length > 0
              ? f.options
              : Prisma.JsonNull, // 這裡也要改！
          required: f.required ?? false,
        })),
      });
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('PATCH error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}