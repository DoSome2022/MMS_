// app/actions/deleteModel.ts
'use server';

import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';


export async function deleteDynamicModel(modelId: string) {
  if (!modelId) {
    return { error: '缺少模型 ID' };
  }

  try {
    // 遞迴刪除所有 DynamicData
    const deleteAllData = async (parentId: string | null) => {
      const children = await db.dynamicData.findMany({
        where: { parentId },
        select: { id: true },
      });

      for (const child of children) {
        await deleteAllData(child.id);
      }

      if (parentId) {
        await db.dynamicData.deleteMany({ where: { parentId } });
      } else {
        await db.dynamicData.deleteMany({
          where: { dynamicModelId: modelId, parentId: null },
        });
      }
    };

    await deleteAllData(null);

    // 刪除欄位
    await db.dynamicField.deleteMany({
      where: { dynamicModelId: modelId },
    });

    // 刪除模型
    await db.dynamicModel.delete({
      where: { id: modelId },
    });

    revalidatePath('/spec');
    return { success: true };
  } catch (error: any) {
    return { error: error.message || '刪除失敗' };
  }
}