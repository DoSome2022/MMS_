// // app/actions/data.ts
'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';

const PATH = '/spec';

/**
 * 新增一筆資料（支援根層或子層）
 */
// app/actions/data.ts
import { redirect } from 'next/navigation';

export async function createData(
  modelId: string,
  parentId?: string | null,
  isContentBlock = false
) {
  await db.dynamicData.create({
    data: {
      dynamicModelId: modelId,
      parentId: parentId ?? null,
      data: {},
      isContentBlock,
    },
  });

  // 關鍵：改用 redirect 強制跳轉，保證頁面重新渲染！
  redirect('/spec');
}
/**
 * 更新資料內容（只更新 data 欄位）
 */
export async function updateData(id: string, data: Record<string, any>) {
  await db.dynamicData.update({
    where: { id },
    data: { data },
  });

  revalidatePath(PATH);
}

/**
 * 遞迴刪除（包含所有子項目）
 */
export async function deleteData(id: string) {
  const deleteRecursive = async (dataId: string) => {
    // 找出所有直屬子項目
    const children = await db.dynamicData.findMany({
      where: { parentId: dataId },
      select: { id: true },
    });

    // 先刪子項目
    for (const child of children) {
      await deleteRecursive(child.id);
    }

    // 再刪自己
    await db.dynamicData.delete({ where: { id: dataId } });
  };

  await deleteRecursive(id);
  revalidatePath(PATH);
}