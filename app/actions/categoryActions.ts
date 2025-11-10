// app/actions/categoryActions.ts
'use server';

import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';


export async function createCategory(title: string) {
  if (!title.trim()) return { error: '分類名稱不能為空' };

  try {
    const category = await db.a.create({
      data: { title, slug: title.toLowerCase().replace(/\s+/g, '-'), desc: '', category: 'custom', price: 0 },
    });
    revalidatePath('/spec/create');
    return { success: true, category };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function deleteCategory(id: string) {
  try {
    await db.a.delete({ where: { id } });
    revalidatePath('/spec/create');
    return { success: true };
  } catch (error: any) {
    return { error: '無法刪除，可能有模型正在使用此分類' };
  }
}