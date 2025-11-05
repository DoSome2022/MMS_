// app/api/dynamic-model/[id]/route.ts
import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { Prisma } from '@prisma/client';


// ---------- 輸入驗證 ----------
const updateSchema = z.object({
  name: z.string().min(1).optional(),
  fields: z
    .array(
      z.object({
        id: z.string().optional(),
        label: z.string().min(1),
        key: z.string().min(1).regex(/^[a-zA-Z0-9_]+$/),
        type: z.enum(['text', 'number', 'select', 'boolean', 'model']),
        options: z.array(z.string()).nullable().optional(),
        required: z.boolean().optional(),
        refModelId: z.string().nullable().optional(),
      })
    )
    .optional(),
});

type UpdateBody = z.infer<typeof updateSchema>;

// ---------- GET：取得模型 ----------
export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const model = await db.dynamicModel.findUnique({
      where: { id },
      include: {
        fields: {
          include: { refModel: { select: { id: true, name: true } } },
          orderBy: { createdAt: 'asc' },
        },
        dataRows: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!model) {
      return NextResponse.json({ error: 'Model not found' }, { status: 404 });
    }

    return NextResponse.json(model);
  } catch (error) {
    console.error('GET /dynamic-model/[id] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ---------- PATCH：更新模型 ----------
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const body = await req.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { name, fields } = parsed.data;

    const updated = await db.$transaction(async (tx) => {
      // 1. 更新名稱
      const modelData: any = {};
      if (name) modelData.name = name;

      const model = await tx.dynamicModel.update({
        where: { id },
        data: modelData,
        include: { fields: true },
      });

      // 2. 更新欄位
      if (fields) {
        await tx.dynamicField.deleteMany({
          where: { dynamicModelId: id },
        });

        await tx.dynamicField.createMany({
          data: fields.map((f) => ({
            id: f.id ?? undefined,
            dynamicModelId: id,
            label: f.label,
            key: f.key,
            type: f.type,
            options: f.options
              ? f.options.length > 0
                ? f.options
                : Prisma.JsonNull
              : Prisma.JsonNull,
            required: f.required ?? false,
            refModelId: f.type === 'model' ? f.refModelId ?? null : null,
          })),
        });
      }

      return await tx.dynamicModel.findUnique({
        where: { id },
        include: {
          fields: { include: { refModel: { select: { id: true, name: true } } } },
          dataRows: true,
        },
      });
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Model not found' }, { status: 404 });
    }
    console.error('PATCH /dynamic-model/[id] error:', error);
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}

// ---------- DELETE：刪除模型 ----------
export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    await db.$transaction(async (tx) => {
      // 刪除資料列
      await tx.dynamicData.deleteMany({ where: { dynamicModelId: id } });
      // 刪除欄位
      await tx.dynamicField.deleteMany({ where: { dynamicModelId: id } });
      // 刪除模型
      await tx.dynamicModel.delete({ where: { id } });
    });

    return new NextResponse(null, { status: 204 });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Model not found' }, { status: 404 });
    }
    console.error('DELETE /dynamic-model/[id] error:', error);
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
  }
}