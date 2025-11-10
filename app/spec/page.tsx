// app/spec/page.tsx


import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Plus } from 'lucide-react';

import { getACategories } from '@/app/actions/getCategories';
import { db } from '@/lib/db';
import { NestedDataList } from '@/components/NextedDataList';
import { DeleteModelButton } from '@/components/DeleteModelButton';

export const revalidate = 0;

export default async function SpecPage() {
  const [models, categories] = await Promise.all([
    db.dynamicModel.findMany({
      select: { id: true, name: true },
      orderBy: { createdAt: 'desc' },
    }),
    getACategories(),
  ]);

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">動態規格管理系統</h1>
        {/* <CreateModelDialog categories={categories} /> */}
        <Button asChild>
          <Link href="/spec/create">
            <Plus className="w-4 h-4 mr-2" />
            建立新模型
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {models.length === 0 ? (
          <p className="col-span-full text-center text-muted-foreground">
            尚未建立任何模型，請點擊右上角按鈕開始。
          </p>
        ) : (
          models.map((model) => (
            <div
              key={model.id}
              className="border rounded-lg p-6 bg-card hover:shadow-md transition-shadow relative"
            >
              {/* 刪除按鈕（右上角） */}
              <div className="absolute top-2 right-2">
                <DeleteModelButton modelId={model.id} modelName={model.name} />
              </div>

              <h3 className="text-xl font-semibold mb-2 pr-8">{model.name}</h3>
              <NestedDataList modelId={model.id} modelName={model.name} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// // app/spec/page.tsx

// import { CreateModelDialog } from '@/components/CreateModelDialog';

// import { getACategories } from '@/app/actions/getCategories';
// import { db } from '@/lib/db';
// import { NestedTable } from '@/components/NestedTable';

// export const revalidate = 0;

// export default async function SpecPage() {
//   const [models, categories] = await Promise.all([
//     db.dynamicModel.findMany({
//       select: { id: true, name: true },
//       orderBy: { createdAt: 'desc' },
//     }),
//     getACategories(),
//   ]);

//   return (
//     <div className="container mx-auto py-8 space-y-12">
//       {/* 標題與建立按鈕 */}
//       <div className="flex justify-between items-center">
//         <h1 className="text-3xl font-bold">動態規格管理系統</h1>
//         <CreateModelDialog categories={categories} />
//       </div>

//       {/* 每個模型一整頁表格 */}
//       <div className="space-y-16">
//         {models.length === 0 ? (
//           <p className="text-center text-muted-foreground py-12">
//             尚未建立任何模型，請點擊右上角按鈕開始。
//           </p>
//         ) : (
//           models.map((model) => (
//             <section key={model.id} className="bg-white rounded-xl shadow-sm border">
//               <div className="p-6 border-b">
//                 <h2 className="text-2xl font-semibold">{model.name}</h2>
//               </div>
//               <NestedTable modelId={model.id} />
//             </section>
//           ))
//         )}
//       </div>
//     </div>
//   );
// }