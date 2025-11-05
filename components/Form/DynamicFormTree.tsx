// components/Form/DynamicFormTree.tsx
'use client';

import Link from 'next/link';
import useSWR from 'swr';
import { DynamicForm } from './DynamicForm';

const fetcher = (url: string) => fetch(url).then(r => r.json());

type Props = {
  modelId: string;
  currentPath?: string[];
  isDataRow?: boolean; // 新增：是否為「資料列」
};

export function DynamicFormTree({ modelId, currentPath = [], isDataRow = false }: Props) {
  const { data: model, mutate } = useSWR(`/api/dynamic-model/${modelId}`, fetcher);
  const depth = currentPath.length;

  if (!model) return <div className={`pl-${depth * 4}`}>載入中...</div>;

  return (
    <div className={`space-y-6 ${depth > 0 ? 'ml-6 border-l-2 border-blue-200 pl-4' : ''}`}>
      {/* === 只有在「資料列」才顯示多筆資料 === */}
      {isDataRow && model.dataRows?.length > 0 ? (
        model.dataRows.map((row: any) => (
          <div key={row.id} className="p-4 bg-gray-50 rounded-lg border">
            {model.fields.map((f: any) => {
              const value = row.data[f.key];
              const nextPath = [...currentPath, String(value)];

              return (
                <div key={f.key} className="mb-2">
                  <strong>{f.label}：</strong>{' '}
                  <Link
                    href={`/a/${nextPath.join('/')}`}
                    className="text-blue-600 hover:underline font-medium"
                  >
                    {value ?? '-'}
                  </Link>
                </div>
              );
            })}
          </div>
        ))
      ) : (
        /* === 模型頁面：只顯示欄位名稱 + 連結 === */
        <div className="space-y-3">
          {model.fields.map((f: any) => {
            const placeholderPath = [...currentPath, f.key]; // 點擊進入子模型
            return (
              <div key={f.key} className="flex items-center justify-between p-3 bg-blue-50 rounded border">
                <strong>{f.label}</strong>
                <Link
                  href={`/a/${placeholderPath.join('/')}`}
                  className="text-sm text-blue-600 hover:underline"
                >
                  進入 {f.label} →
                </Link>
              </div>
            );
          })}
        </div>
      )}

      {/* === 新增按鈕永遠存在 === */}
      <DynamicForm model={model} onSuccess={mutate} />
    </div>
  );
}