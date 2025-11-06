// app/api/a/path/[...path]/route.ts
import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// app/api/a/[...path]/route.ts
export async function GET(
  req: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const segments = path ?? [];

  // Step 1: 找商品
  const first = segments[0];
  const isUUID = UUID_REGEX.test(first);
  const product = isUUID
    ? await db.a.findUnique({ where: { id: first } })
    : await db.a.findFirst({ where: { slug: first } });

  if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  // Step 2: 從根開始，一層一層往下找
  let currentParentData: any = null;
  let currentModel: any = null;
  let breadcrumbs: string[] = [product.title];

  for (let i = 1; i < segments.length; i++) {
    const segment = segments[i];

    if (i === 1) {
      // 第一層：找規格表
      currentModel = await db.dynamicModel.findFirst({
        where: { aId: product.id, name: segment },
        include: { fields: true },
      });
    } else {
      // 之後每一層：找上一層資料的子資料
      const fieldKey = currentModel.fields.find((f: any) => 
        f.dynamicModel.name === segments[i-1]
      )?.key;

      currentParentData = await db.dynamicData.findFirst({
        where: {
          dynamicModelId: currentModel.id,
          data: { path: [fieldKey], equals: segment },
          parentId: currentParentData?.id || null,
        },
      });
    }

    if (!currentModel && !currentParentData) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    breadcrumbs.push(segment);
  }

  // Step 3: 取得當前層的資料列表
  const currentDataList = await db.dynamicData.findMany({
    where: {
      dynamicModelId: currentModel?.id || null,
      parentId: currentParentData?.id || null,
    },
    include: {
      dynamicModel: { include: { fields: true } },
    },
  });

  return NextResponse.json({
    type: 'tree-node',
    product,
    currentModel,
    currentParentData,
    currentDataList,
    breadcrumbs,
    depth: segments.length - 1,
  });
}