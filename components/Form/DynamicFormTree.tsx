// components/DynamicFormTree.tsx
'use client';

import useSWR from 'swr';
import { DynamicForm } from './DynamicForm';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function DynamicFormTree({ modelId, depth = 0 }: { modelId: string; depth?: number }) {
  const { data: model, mutate } = useSWR(`/api/dynamic-model/${modelId}`, fetcher);

  if (!model) return <div className="pl-6">載入中...</div>;

  return (
    <div className={`${depth > 0 ? 'ml-6 border-l-2 border-blue-200 pl-4' : ''}`}>
      <h4 className="font-semibold text-blue-700 mb-2">
        {model.name}
        {depth > 0 && <span className="text-xs text-gray-500 ml-2">(層級 {depth})</span>}
      </h4>

      {model.dataRows?.map((row: any) => (
        <div key={row.id} className="mb-4 p-3 bg-gray-50 rounded">
          {model.fields.map((f: any) => {
            if (f.type === 'model' && row.data[f.key]) {
              return (
                <div key={f.key} className="mb-2">
                  <span className="font-medium">{f.label}：</span>
                  <DynamicFormTree modelId={row.data[f.key]} depth={depth + 1} />
                </div>
              );
            }
            return (
              <p key={f.key}>
                <span className="font-medium">{f.label}：</span>{' '}
                {row.data[f.key] ?? '-'}
              </p>
            );
          })}
        </div>
      ))}

      <DynamicForm model={model} onSuccess={mutate} />
    </div>
  );
}