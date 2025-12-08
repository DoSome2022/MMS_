// components/NestedDataTable.tsx
'use client';

import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { createData } from '@/app/actions/data';
import { NestedDataTableBody } from './NestedDataTableBody';

interface Props {
  items: any[];
  fields: any[];
  modelId: string;
  parentId: string | null;
  level: number;
}

export function NestedDataTable({ items, fields, modelId, parentId, level }: Props) {
  return (
    <div className={level === 0 ? '' : 'pl-10 pt-4 border-l-2 border-muted'}>
      {/* 1. 最外層專屬：新增根欄目（內容區塊） */}
      {level === 0 && (
        <div className="mb-6 flex justify-end">
          <form action={createData.bind(null, modelId, null, true)}>
            <Button type="submit" variant="secondary" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              新增內容區塊
            </Button>
          </form>
        </div>
      )}

      {/* 2. 每層都有的：新增子項目 */}
      <div className="mb-4 flex justify-end">
        <form action={createData.bind(null, modelId, parentId ?? null, false)}>
          <Button type="submit" size="sm" variant={level === 0 ? 'default' : 'outline'}>
            <Plus className="w-4 h-4 mr-1" />
            {level === 0 ? '新增主項目' : '新增子項目'}
          </Button>
        </form>
      </div>

      {/* 3. 表格本體：即使 items 為空也要渲染（讓它顯示「尚未建立」） */}
      <NestedDataTableBody
        items={items}
        fields={fields}
        modelId={modelId}
        level={level}
        parentId={parentId}
      />
    </div>
  );
}