// // components/NestedDataTableClient.tsx
// 'use client';

// import { Button } from '@/components/ui/button';
// import { Plus } from 'lucide-react';

// import { Suspense } from 'react';
// import { TableSkeleton } from './TableSkeleton';
// import { createData } from '@/app/actions/data';
// import { useRouter } from 'next/navigation';
// import { useState } from 'react';
// import { NestedDataRow } from './NextedDataRow';

// interface Props {
//   items: any[];
//   fields: any[];
//   modelId: string;
//   parentId: string | null;
//   level: number;
// }

// export function NestedDataTableClient({ 
//   items: initialItems, 
//   fields, 
//   modelId, 
//   parentId, 
//   level 
// }: Props) {
//   const [items, setItems] = useState(initialItems);
//   const [isPending, setIsPending] = useState(false);
//   const router = useRouter();

//   const handleCreate = async () => {
//     setIsPending(true);
    
//     try {
//       // 1. 立即更新本地狀態（樂觀更新）
//       const tempId = `temp-${Date.now()}`;
//       const newItem = {
//         id: tempId,
//         data: {},
//         dynamicModelId: modelId,
//         parentId: parentId,
//         children: [],
//         createdAt: new Date(),
//         updatedAt: new Date()
//       };
      
//       setItems(prev => [...prev, newItem]);
      
//       // 2. 創建數據
//       await createData(modelId, parentId || undefined);
      
//       // 3. 刷新頁面獲取真實數據
//       router.refresh();
      
//     } catch (error) {
//       console.error('創建失敗:', error);
//       // 回滾：移除臨時項目
//       setItems(prev => prev.filter(item => !item.id.startsWith('temp-')));
//     } finally {
//       setIsPending(false);
//     }
//   };

//   return (
//     <>
//       <div className="mb-4 flex justify-end">
//         <Button 
//           onClick={handleCreate}
//           type="button" 
//           size="sm" 
//           variant={level === 0 ? 'default' : 'outline'}
//           disabled={isPending}
//           className="gap-1"
//         >
//           <Plus className="w-4 h-4" />
//           {isPending ? '創建中...' : level === 0 ? '新增資料' : '新增子項目'}
//         </Button>
//       </div>

//       {items.length === 0 ? (
//         <div className="text-center py-12 border rounded-lg bg-muted/10">
//           <p className="text-muted-foreground mb-2">尚無資料</p>
//           <p className="text-sm text-muted-foreground">點擊上方按鈕新增資料</p>
//         </div>
//       ) : (
//         <div className="overflow-x-auto rounded-md border">
//           <table className="w-full">
//             <thead className="bg-muted/50">
//               <tr>
//                 <th className="px-4 py-3 text-left font-medium text-muted-foreground w-16">
//                   展開
//                 </th>
//                 {fields.map((field) => (
//                   <th key={field.key} className="px-4 py-3 text-left font-medium text-muted-foreground">
//                     {field.label}
//                   </th>
//                 ))}
//                 <th className="px-4 py-3 text-right font-medium text-muted-foreground w-32">
//                   操作
//                 </th>
//               </tr>
//             </thead>
//             <tbody>
//               <Suspense fallback={<TableSkeleton fields={fields} rowCount={items.length} />}>
//                 {items.map((item) => (
//                   <NestedDataRow
//                     key={item.id}
//                     item={item}
//                     fields={fields}
//                     modelId={modelId}
//                     level={level}
//                   />
//                 ))}
//               </Suspense>
//             </tbody>
//           </table>
//         </div>
//       )}
//     </>
//   );
// }


// components/NestedDataTableClient.tsx
'use client';

import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Suspense, useTransition } from 'react';
import { TableSkeleton } from './TableSkeleton';
import { createData } from '@/app/actions/data';
import { useRouter } from 'next/navigation';

import { SafeDynamicData, Field } from '@/types';
import { NestedDataRow } from './NextedDataRow';

interface Props {
  items: SafeDynamicData[];
  fields: Field[];
  modelId: string;
  parentId: string | null;
  level: number;
}

export function NestedDataTableClient({ 
  items, 
  fields, 
  modelId, 
  parentId, 
  level 
}: Props) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleCreate = () => {
    startTransition(async () => {
      try {
        await createData(modelId, parentId || undefined);
        // 刷新頁面獲取最新數據
        router.refresh();
      } catch (error) {
        console.error('創建失敗:', error);
      }
    });
  };

  return (
    <>
      <div className="mb-4 flex justify-end">
        <Button 
          onClick={handleCreate}
          type="button" 
          size="sm" 
          variant={level === 0 ? 'default' : 'outline'}
          disabled={isPending}
          className="gap-1"
        >
          <Plus className="w-4 h-4" />
          {isPending ? '創建中...' : level === 0 ? '新增資料' : '新增子項目'}
        </Button>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-12 border rounded-lg bg-muted/10">
          <p className="text-muted-foreground mb-2">尚無資料</p>
          <p className="text-sm text-muted-foreground">點擊上方按鈕新增資料</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-md border">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground w-16">
                  展開
                </th>
                {fields.map((field) => (
                  <th key={field.key} className="px-4 py-3 text-left font-medium text-muted-foreground">
                    {field.label}
                  </th>
                ))}
                <th className="px-4 py-3 text-right font-medium text-muted-foreground w-32">
                  操作
                </th>
              </tr>
            </thead>
            <tbody>
              <Suspense fallback={<TableSkeleton fields={fields} rowCount={items.length} />}>
                {items.map((item) => (
                  <NestedDataRow
                    key={item.id}
                    item={item}
                    fields={fields}
                    modelId={modelId}
                    level={level}
                    parentId={parentId}
                  />
                ))}
              </Suspense>
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}