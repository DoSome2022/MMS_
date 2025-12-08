// app/spec/page.tsx
import { ModelAccordionClient } from '@/components/Model/ModelAccordionClient';
import { NestedDataTable } from '@/components/Model/NestedDataTable';
import { Button } from '@/components/ui/button';
import { db } from '@/lib/db';
import { buildTree } from '@/lib/tree';
import { LayoutPanelLeft, Plus } from 'lucide-react';
import Link from 'next/link';

export default async function SpecPage() {
  const models = await db.dynamicModel.findMany({
    include: {
      fields: true,
      dataRows: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  const modelsWithTree = models.map(model => {
    // 關鍵：明確判斷 isContentBlock，避免 undefined 問題
    const specItems = model.dataRows.filter((item: any) => item.isContentBlock !== true);
    const contentBlocks = model.dataRows.filter((item: any) => item.isContentBlock === true);

    return {
      ...model,
      specTree: buildTree(specItems),
      contentBlocks: buildTree(contentBlocks),
    };
  });

  console.log("modelsWithTree : ",modelsWithTree ,"-- End --" )

  return (
    <>
      <div className="container mx-auto py-8 space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">動態規格管理系統</h1>
          <Button asChild className="ml-auto">
            <Link href="/spec/create">
              <Plus className="w-4 h-4 mr-2" />
              建立新模型
            </Link>
          </Button>
        </div>
      </div>
      
      <div className="container mx-auto py-12 max-w-7xl">
        {modelsWithTree.map(model => (
          <div key={model.id} className="mb-16">
            <h1 className="text-3xl font-bold mb-8 text-center">{model.name}</h1>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
              {/* 左邊：規格樹 */}
              <div className="xl:col-span-1">
                <div className="bg-card border rounded-xl p-6 shadow-sm">
                  <h2 className="text-xl font-semibold mb-4">規格結構</h2>
                  
                  {/* 修改這裡：移除條件渲染，總是顯示 NestedDataTable */}
                  <ModelAccordionClient
                    modelName="主規格樹"
                    count={model.specTree.length}
                  >
                    {/* 調試：顯示數據狀態 */}
                    <div className="text-xs text-gray-500 mb-2">
                      數據條目：{model.specTree.length} 條
                    </div>
                    
                    <NestedDataTable
                      items={model.specTree}
                      fields={model.fields ?? []}
                      modelId={model.id}
                      parentId={null}
                      level={0}
                    />
                  </ModelAccordionClient>
                  
                  {/* 如果確實需要空狀態提示，可以放在這裡 */}
                  {model.specTree.length === 0 && (
                    <div className="text-center py-4 text-muted-foreground text-sm">
                      <p>點擊上方按鈕開始新增規格項目</p>
                    </div>
                  )}
                </div>
              </div>

              {/* 右邊：內容區塊 */}
              <div className="xl:col-span-2">
                <h2 className="text-2xl font-semibold mb-6">內容區塊</h2>
                
                {/* 內容區塊的部分保持不變 */}
                {model.contentBlocks.length === 0 ? (
                  <div className="text-center py-20 border-2 border-dashed rounded-xl text-muted-foreground">
                    <p className="text-lg mb-4">尚未建立內容區塊</p>
                    <p className="text-sm">在左側任意項目點擊按鈕新增</p>
                  </div>
                ) : (
                  <div className="grid gap-6 md:grid-cols-2">
                    {model.contentBlocks.map((block: any) => (
                      <div
                        key={block.id}
                        className="border rounded-xl p-6 bg-card shadow hover:shadow-lg transition"
                      >
                        <div className="flex items-center gap-2 mb-4">
                          <LayoutPanelLeft className="w-5 h-5 text-emerald-600" />
                          <span className="font-medium text-emerald-700">內容區塊</span>
                        </div>
                        <NestedDataTable
                          items={[block]}
                          fields={model.fields ?? []}
                          modelId={model.id}
                          parentId={null}
                          level={0}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}


// // app/spec/page.tsx （極簡測試版，保證看到資料！）
// import { db } from '@/lib/db';

// export default async function SpecPage() {
//   // 直接抓所有 DynamicData 測試
//   const allData = await db.dynamicData.findMany({
//     include: {
//       dynamicModel: true,
//     },
//   });

//   console.log("所有 DynamicData:", allData);

//   const models = await db.dynamicModel.findMany({
//     include: {
//       fields: true,
//       dataRows: {
//         include: {
//           children: true,
//         },
//       },
//     },
//   });

//   console.log("完整 models:", models);

//   return (
//     <div className="p-8">
//       <h1 className="text-4xl font-bold mb-8">除錯頁面</h1>
      
//       <pre className="bg-black text-green-400 p-4 rounded overflow-auto">
//         {JSON.stringify(models, null, 2)}
//       </pre>

//       <div className="mt-8">
//         <h2 className="text-2xl mb-4">資料筆數統計：</h2>
//         <p>模型數量：{models.length}</p>
//         <p>總資料筆數：{allData.length}</p>
//         {models.map(m => (
//           <p key={m.id}>{m.name}: {m.dataRows.length} 筆</p>
//         ))}
//       </div>
//     </div>
//   );
// }