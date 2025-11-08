// components/Form/DynamicFormTree.tsx
'use client';

import Link from 'next/link';
import useSWR from 'swr';
import { DynamicForm } from './DynamicForm';

const fetcher = (url: string) => fetch(url).then(r => r.json());

type Props = {
  modelId: string | null;
  currentPath?: string[];
  parentDataId?: string | null;
};

export function DynamicFormTree({
  modelId,
  currentPath = [],
  parentDataId = null,
}: Props) {
  const depth = currentPath.length;

  // 無論如何都要先執行 Hooks！
  const { data: model, mutate: mutateModel } = useSWR(
    modelId ? `/api/dynamic-model/${modelId}` : null,
    fetcher
  );

  const { data: dataRows = [], mutate: mutateData } = useSWR(
    modelId ? `/api/dynamic-data/${modelId}?parentId=${parentDataId || ''}` : null,
    fetcher
  );

  // 現在才開始條件渲染
  if (!modelId) {
    return (
      <div className={`space-y-6 ${depth > 0 ? 'ml-6 border-l-2 border-blue-200 pl-4' : ''}`}>
        <div className="p-6 bg-yellow-50 border border-yellow-300 rounded-lg">
          <p className="text-lg font-medium text-yellow-800 mb-4">
            尚未建立任何欄位
          </p>
          <DynamicForm model={null} onSuccess={mutateModel} />
        </div>
      </div>
    );
  }

  // model 還在載入
  if (model === undefined) {
    return <div className="text-gray-500">載入中...</div>;
  }

  // model 載入失敗
  if (model === null) {
    return <div className="text-red-500">載入失敗</div>;
  }

  const hasData = dataRows.length > 0;

  return (
    <div className={`space-y-6 ${depth > 0 ? 'ml-6 border-l-2 border-blue-200 pl-4' : ''}`}>
      {/* 無資料 */}
      {!hasData && (
        <div className="p-6 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border">
          <p className="text-lg font-medium text-blue-900 mb-4">
            尚未建立任何資料
          </p>
          <DynamicForm 
            model={model} 
            parentDataId={parentDataId} 
            onSuccess={() => mutateData()} 
          />
        </div>
      )}

      {/* 有資料 */}
      {hasData && (
        <div className="space-y-4">
          {dataRows.map((row: any) => {
            const primaryValue = row.data[model.fields[0]?.key] || '未命名';

            return (
              <div
                key={row.id}
                className="p-5 bg-white rounded-xl border-2 border-blue-100 shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex items-center justify-between">
                  <Link
                    href={`/a/${[...currentPath, primaryValue].join('/')}`}
                    className="text-xl font-bold text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    {primaryValue} →
                  </Link>
                  <span className="text-sm text-gray-500">
                    ID: {row.id.slice(-6)}
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                  {model.fields.map((f: any) => (
                    <div key={f.key}>
                      <span className="font-medium text-gray-700">{f.label}：</span>{' '}
                      <span className="text-gray-900">
                        {row.data[f.key] ?? '-'}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-4">
                  <DynamicFormTree
                    modelId={modelId}
                    currentPath={[...currentPath, primaryValue]}
                    parentDataId={row.id}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 永遠顯示新增表單 */}
      {hasData && (
        <div className="mt-8 p-6 bg-green-50 rounded-xl border-2 border-green-200">
          <p className="font-medium text-green-800 mb-4">在此層新增資料</p>
          <DynamicForm 
            model={model} 
            parentDataId={parentDataId} 
            onSuccess={() => mutateData()} 
          />
        </div>
      )}
    </div>
  );
}