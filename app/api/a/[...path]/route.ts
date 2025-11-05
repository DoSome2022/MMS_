// app/api/a/path/[...path]/route.ts
import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import { DynamicModel, DynamicData, DynamicField } from '@prisma/client';

export async function GET(
  _: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;

  if (path.length === 0) {
    const products = await db.a.findMany({
      select: { id: true, title: true, slug: true },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ type: 'root', products });
  }

  // 拒絕 UUID 開頭（應走 /api/a/[id]）
  const first = path[0];
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(first);
  if (isUUID) {
    return NextResponse.json(
      { error: 'Use /api/a/[id] for UUID paths' },
      { status: 400 }
    );
  }

  try {
    let currentModelId: string | null = null;
    let currentData: DynamicData | null = null;
    let aId: string;

    // Step 1: 找商品（用 slug）
    const product = await db.a.findUnique({
      where: { slug: first },
      select: { id: true },
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    aId = product.id;
    let index = 1;

    while (index < path.length) {
      const fieldKey = path[index];     // e.g., "顏色"
      const fieldValue = path[index + 1] || null; // e.g., "紅色"

      // Step 2: 找模型
      let model: DynamicModel | null = null;

      if (currentModelId) {
        model = await db.dynamicModel.findUnique({
          where: { id: currentModelId },
        });
      } else {
        model = await db.dynamicModel.findFirst({
          where: { aId, name: fieldKey },
        });
      }

      if (!model) break;
      currentModelId = model.id;

      if (!fieldValue) break; // 最後一段是 model

      // Step 3: 找資料列（用 string_contains）
      const dataRow = await db.dynamicData.findFirst({
        where: {
          dynamicModelId: model.id,
          data: { string_contains: fieldValue },
        },
      });

      if (dataRow) {
        currentData = dataRow;

        // Step 4: 找 model 欄位 → 子模型
        const modelField: DynamicField | null = await db.dynamicField.findFirst({
          where: {
            dynamicModelId: model.id,
            type: 'model',
            key: fieldKey,
          },
        });

        if (modelField?.refModelId) {
          currentModelId = modelField.refModelId;
        }
      }

      index += 2;
    }

    // Step 5: 回傳最終模型
    const finalModel = currentModelId
      ? await db.dynamicModel.findUnique({
          where: { id: currentModelId },
          include: {
            fields: {
              include: { refModel: true },
              orderBy: { createdAt: 'asc' },
            },
            dataRows: {
              orderBy: { createdAt: 'desc' },
            },
          },
        })
      : null;

    return NextResponse.json({
      currentModel: finalModel,
      currentData,
      breadcrumbs: path,
      isDataRow: path.length % 2 === 1,
      type: 'dynamic-path',
    });
  } catch (error) {
    console.error('Path resolution error:', error);
    return NextResponse.json(
      { error: 'Invalid path' },
      { status: 400 }
    );
  }
}