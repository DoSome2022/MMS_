// app/api/a/[id]/route.ts
import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // 驗證 UUID 格式
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(id)) {
    return NextResponse.json(
      { error: 'Invalid UUID format' },
      { status: 400 }
    );
  }

  try {
    const product = await db.a.findUnique({
      where: { id },
      include: {
        dynamicModels: {
          select: { id: true, name: true },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      currentModel: null,
      currentData: null,
      product,
      breadcrumbs: [product.slug || id],
      isDataRow: false,
      type: 'product-root',
    });
  } catch (error) {
    console.error('GET /api/a/[id] error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}