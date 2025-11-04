// app/a/[id]/page.tsx
'use client';

import { use } from 'react';
import useSWR from 'swr';
import { DynamicForm } from '@/components/Form/DynamicForm';
import { ModelCreator } from '@/components/Form/ModelCreator';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data, error, mutate } = useSWR(`/api/a/${id}`, fetcher);

  if (error) return <div className="text-red-500">載入失敗</div>;
  if (!data) return <div className="text-gray-500">載入中...</div>;

const hasModels = data.dynamicModels && data.dynamicModels.length > 0;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">{data.title}</h1>
      <p className="text-gray-600 mb-6">{data.desc} | NT${data.price}</p>

      {/* 模型建構器 */}
      <ModelCreator aId={id} onSuccess={mutate} />
     
{/* 現有模型列表 */}
      {hasModels ? (
        data.dynamicModels.map((model: any) => (
          <div key={model.id} className="mt-8 border rounded-lg p-4 bg-white shadow-sm">
            <h2 className="text-xl font-semibold mb-3 text-blue-700">{model.name}</h2>
            {/* ... 表格 + DynamicForm ... */}
            <DynamicForm model={model} onSuccess={mutate} />
          </div>
        ))
      ) : (
        <p className="text-center text-gray-500 mt-8">點擊上方按鈕建立第一個規格表</p>
      )}

    </div>
  );
}