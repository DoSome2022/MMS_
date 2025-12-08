// components/DataTable.tsx
'use client';

import React, { useState } from 'react'; // ← 關鍵：加入 React 匯入
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronRight, Plus } from 'lucide-react';
import { NestedDataItem } from './NestedDataItem';

interface Data {
  id: string;
  data: Record<string, any>;
  children: Data[];
}

interface Field {
  id: string;
  key: string;
  label: string;
  type: string;
  options?: string[];
  required?: boolean;
}

interface Props {
  items: Data[];
  fields: Field[];
  modelId: string;
  parentId?: string;
  level: number;
  onCreateChild: (parentId: string) => void;
}

export function DataTable({
  items,
  fields,
  modelId,
  parentId,
  level,
  onCreateChild,
}: Props) {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());

  const toggleOpen = (id: string) => {
    setOpenItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        尚無資料
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b">
            <th className="w-10 p-2 text-left">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onCreateChild(parentId || '')}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </th>
            {fields.map((field) => (
              <th key={field.key} className="p-2 text-left font-medium">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </th>
            ))}
            <th className="w-20"></th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <React.Fragment key={item.id}>
              <tr className="border-b hover:bg-muted/50">
                <td className="p-2">
                  {item.children.length > 0 && (
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6"
                      onClick={() => toggleOpen(item.id)}
                    >
                      {openItems.has(item.id) ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </Button>
                  )}
                </td>
                {fields.map((field) => (
                  <td key={field.key} className="p-2">
                    <div className="max-w-xs truncate">
                      {field.type === 'image' && item.data[field.key] ? (
                        <img
                          src={item.data[field.key]}
                          alt={field.label}
                          className="w-10 h-10 object-cover rounded"
                        />
                      ) : (
                        String(item.data[field.key] ?? '—')
                      )}
                    </div>
                  </td>
                ))}
                <td className="p-2 text-right">
                  <NestedDataItem
                    data={item}
                    fields={fields}
                    modelId={modelId}
                    parentId={parentId}
                    level={level}
                    inline={true}
                  />
                </td>
              </tr>

              {/* 子層橫向展開 */}
              {openItems.has(item.id) && item.children.length > 0 && (
                <tr>
                  <td colSpan={fields.length + 2} className="p-0">
                    <div className="pl-8 py-2 bg-muted/30">
                      <DataTable
                        items={item.children}
                        fields={fields}
                        modelId={modelId}
                        parentId={item.id}
                        level={level + 1}
                        onCreateChild={onCreateChild}
                      />
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}