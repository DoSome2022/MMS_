// app/api/a/[...path]/route.ts
import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
// 刪掉這行！不需要 Prisma.DbNull
// import { Prisma } from '@prisma/client';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: segments } = await params;

  try {
    const productId = segments[0];
    const product = await db.a.findUnique({
      where: { id: productId },
      include: { 
        dynamicModels: {
          include: { fields: true }
        }
      },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    if (segments.length === 1) {
      return NextResponse.json({
        type: 'product-root',
        product,
        breadcrumbs: [product.title],
      });
    }

    const modelName = decodeURIComponent(segments[1]);
    const currentModel = product.dynamicModels.find((m: any) => m.name === modelName);

    if (!currentModel) {
      return NextResponse.json({
        type: 'model-missing',
        breadcrumbs: [product.title, modelName],
      });
    }

    let currentParentData: any = null;

    for (let i = 2; i < segments.length; i++) {
      const segmentValue = decodeURIComponent(segments[i]);

      const results = await db.$queryRaw`
        SELECT * FROM "DynamicData"
        WHERE "dynamicModelId" = ${currentModel.id}
          AND ("parentId" = ${currentParentData?.id} OR "parentId" IS NULL)
          AND data::text LIKE ${`%${segmentValue}%`}
        ORDER BY "createdAt" DESC
        LIMIT 1
      `;

      const foundData = Array.isArray(results) ? results[0] : results;

      if (!foundData) {
        return NextResponse.json({
          type: 'model-missing',
          breadcrumbs: segments.slice(0, i + 1).map(decodeURIComponent),
        });
      }

      currentParentData = foundData as any;
    }

    // 關鍵修正：用 null，不要用 Prisma.DbNull！
    const children = await db.dynamicData.findMany({
      where: {
        dynamicModelId: currentModel.id,
        parentId: currentParentData ? currentParentData.id : null,  // 改成 null
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      type: 'tree-node',
      product,
      currentModel,
      currentParentData,
      currentDataList: children,
      breadcrumbs: [
        product.title,
        ...segments.slice(1).map(decodeURIComponent),
      ],
    });
  } catch (error: any) {
    console.error('GET /api/a/[...path] error:', error);
    return NextResponse.json(
      { error: 'Server error', details: error.message },
      { status: 500 }
    );
  }
}