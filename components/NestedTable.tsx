// components/NestedTable.tsx
'use client';

import { useQuery } from '@tanstack/react-query';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { NestedTableRow } from './NestedTableRow';

interface Props {
  modelId: string;
}

export function NestedTable({ modelId }: Props) {
  const { data: tree = [], isLoading } = useQuery({
    queryKey: ['data', modelId, null],
    queryFn: () => fetch(`/api/models/${modelId}/data`).then((res) => res.json()),
  });

  const { data: fields = [] } = useQuery({
    queryKey: ['fields', modelId],
    queryFn: () => fetch(`/api/models/${modelId}/fields`).then((res) => res.json()).then(d => d.fields),
  });

  const createRoot = async () => {
    await fetch(`/api/models/${modelId}/data`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: {} }),
    });
    window.location.reload(); // 或用 router.refresh()
  };

  if (isLoading) return <div className="p-8 text-center">載入中...</div>;

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            {fields.map((f: any) => (
              <TableHead key={f.key}>{f.label}</TableHead>
            ))}
            <TableHead className="text-right">
              <Button size="sm" onClick={createRoot}>
                <Plus className="w-4 h-4 mr-1" />
                新增
              </Button>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tree.length === 0 ? (
            <TableRow>
              <TableCell colSpan={fields.length + 1} className="text-center text-muted-foreground py-8">
                尚未有資料，點擊上方按鈕新增
              </TableCell>
            </TableRow>
          ) : (
            tree.map((item: any) => (
              <NestedTableRow
                key={item.id}
                data={item}
                fields={fields}
                modelId={modelId}
                level={0}
              />
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}