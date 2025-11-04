// app/api/dynamic-model/[mid]/data/route.ts

import { db } from "@/lib/db";


export async function POST(
  req: Request,
  { params }: { params: { mid: string } }
) {
  const data = await req.json();

  const row = await db.dynamicData.create({
    data: {
      dynamicModelId: params.mid,
      data,
    },
  });

  return Response.json(row);
}