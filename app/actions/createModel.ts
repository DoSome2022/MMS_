// app/actions/createModel.ts
'use server';

import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';

import { z } from 'zod';

// 表單驗證 Schema
const CreateModelSchema = z.object({
  name: z.string().min(1, '模型名稱必填'),
  aId: z.string().uuid('必須選擇分類'),
  fields: z.array(
    z.object({
      label: z.string().min(1, '欄位標籤必填'),
      key: z.string().min(1, '欄位鍵名必填').regex(/^[a-zA-Z0-9_]+$/, '僅允許英文、數字、下劃線'),
      type: z.enum(['text', 'number', 'select', 'image', 'textarea', 'date']),
      options: z.string().optional(),
      required: z.boolean().default(false),
    })
  ).min(1, '至少需一個欄位'),
});

export async function createDynamicModel(formData: FormData) {
  const raw = {
    name: formData.get('name') as string,
    aId: formData.get('aId') as string,
    fields: JSON.parse(formData.get('fields') as string),
  };

  const result = CreateModelSchema.safeParse(raw);
  if (!result.success) {
    return { error: result.error.format() };
  }

  const { name, aId, fields } = result.data;

  try {
    const model = await db.dynamicModel.create({
      data: {
        name,
        aId,
        fields: {
          create: fields.map((f) => ({
            ...f,
            options: f.type === 'select' ? JSON.parse(f.options || '[]') : undefined,
          })),
        },
      },
      select: { id: true, name: true },
    });

    revalidatePath('/spec');
    return { success: true, model };
  } catch (error: any) {
    return { error: { _errors: [error.message] } };
  }
}