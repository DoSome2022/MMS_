// components/NestedDataTableBody.tsx   ← 改名，避免被 Client import
// 這是純 Server Component，絕對不能被任何 'use client' 檔案 import！

import { NestedDataRow } from "./NextedDataRow";



interface Props {
  items: any[];
  fields: any[];
  modelId: string;
  level: number;
  parentId: string | null;
}

export function NestedDataTableBody({ items, fields, modelId,parentId, level}: Props) {
  if (items.length === 0) {
   
    return (
      <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
        <p className="text-lg">尚未建立項目</p>
        <p className="text-sm mt-2">點擊上方按鈕開始新增</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-md border">
      <table className="w-full">
        <thead className="bg-muted/50">
          <tr>
            <th className="w-12 px-4 py-3 text-left"></th>
            {fields.map((f: any) => (
              <th key={f.key} className="px-4 py-3 text-left font-medium">
                {f.label}
                {f.required && <span className="text-red-500 ml-1">*</span>}
              </th>
            ))}
            <th className="w-48 px-4 py-3 text-right">操作</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <NestedDataRow
              key={item.id}
              item={item}
              fields={fields}
              modelId={modelId}
              level={level}
              parentId={parentId}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}