// app/api/a/[id]/model/route.ts
import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

// export async function POST(
//   req: Request,
//   { params }: { params: Promise<{ id: string }> }
// ) {
//   const { id } = await params;
//   const { name, fields } = await req.json();

//   try {
//     const model = await db.dynamicModel.create({
//       data: {
//         name,
//         a: {
//           connect: { id }, // 明確連結現有 A
//         },
//         fields: {
//           create: fields.map((f: any) => ({
//             label: f.label,
//             key: f.key,
//             type: f.type,
//             options: f.options ?? null,
//             required: f.required ?? false,
//           })),
//         },
//       },
//       include: {
//         fields: true,
//       },
//     });

//     return NextResponse.json(model, { status: 201 });
//   } catch (error: any) {
//     console.error('Create model error:', error);
//     return NextResponse.json(
//       { error: '建立失敗', details: error.message },
//       { status: 500 }
//     );
//   }
// }


// app/api/a/[id]/model/route.ts
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { name, fields } = await req.json();

  const model = await db.dynamicModel.create({
    data: {
      name,
      a: { connect: { id } },
      fields: {
        create: fields.map((f: any) => ({
          label: f.label,
          key: f.key,
          type: f.type,
          options: f.type === 'select' ? f.options : null,
          required: f.required,
          refModelId: f.type === 'model' ? f.refModelId : null,
        })),
      },
    },
    include: { fields: { include: { refModel: true } } },
  });

  return NextResponse.json(model, { status: 201 });
}