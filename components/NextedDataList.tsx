// components/NestedDataList.tsx
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { NestedDataItem } from './NestedDataItem';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface Props {
  modelId: string;
  modelName?: string; // 新增：模型名稱 prop
}

export function NestedDataList({ modelId, modelName = '資料列表' }: Props) {
  const queryClient = useQueryClient();

  const { data: tree = [], isLoading } = useQuery({
    queryKey: ['data', modelId, null],
    queryFn: () => fetch(`/api/models/${modelId}/data`).then((res) => res.json()),
  });

  const { data: fields = [] } = useQuery({
    queryKey: ['fields', modelId],
    queryFn: () =>
      fetch(`/api/models/${modelId}/fields`)
        .then((res) => res.json())
        .then((data) => data.fields),
  });

  const createRoot = useMutation({
    mutationFn: () =>
      fetch(`/api/models/${modelId}/data`, {
        method: 'POST',
        body: JSON.stringify({ data: {} }),
      }).then((res) => res.json()),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['data', modelId, null] }),
  });

  if (isLoading) return <div>載入中...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium mb-3">{modelName}</h3>
        <Button onClick={() => createRoot.mutate()}>
          <Plus className="w-4 h-4 mr-1" />
          新增主項目
        </Button>
      </div>

      <div className="space-y-4">
        {tree.map((item: any) => (
          <NestedDataItem
            key={item.id}
            data={item}
            fields={fields}
            modelId={modelId}
          />
        ))}
      </div>
    </div>
  );
}