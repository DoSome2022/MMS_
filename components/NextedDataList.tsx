

// components/NestedDataList.tsx
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DataTable } from './DataTable';

interface Props {
  modelId: string;
  modelName?: string;
}

export function NestedDataList({ modelId, modelName = '資料列表' }: Props) {
  const queryClient = useQueryClient();

  const { data: tree = [], isLoading } = useQuery({
    queryKey: ['data', modelId, null],
    queryFn: () => fetch(`/api/models/${modelId}/data`).then(res => res.json()),
  });

  const { data: fields = [] } = useQuery({
    queryKey: ['fields', modelId],
    queryFn: () => fetch(`/api/models/${modelId}/fields`).then(res => res.json()).then(d => d.fields),
  });

  const createRoot = useMutation({
    mutationFn: () =>
      fetch(`/api/models/${modelId}/data`, {
        method: 'POST',
        body: JSON.stringify({ data: {} }),
      }).then(res => res.json()),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['data', modelId, null] }),
  });

  if (isLoading) return <div className="py-8 text-center">載入中...</div>;

  return (
    <div>
      <DataTable
        items={tree}
        fields={fields}
        modelId={modelId}
        level={0}
        onCreateChild={(parentId) => {
          if (!parentId) {
            createRoot.mutate();
          } else {
            // 子層新增邏輯（可共用）
            fetch(`/api/models/${modelId}/data`, {
              method: 'POST',
              body: JSON.stringify({ parentId, data: {} }),
            }).then(() => {
              queryClient.invalidateQueries({ queryKey: ['data', modelId, parentId] });
            });
          }
        }}
      />
    </div>
  );
}