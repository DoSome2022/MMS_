// components/NestedDataRow.tsx
'use client';

import { useState, useTransition } from 'react';
import { ChevronDown, ChevronRight, Edit2, Trash2, Plus, FolderTree, LayoutPanelLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { deleteData, createData } from '@/app/actions/data';
import { DynamicFieldInput } from '../DynamicFieldInput';
import { NestedDataTable } from './NestedDataTable';

interface Props {
  item: any;
  fields: any[];
  modelId: string;
  level: number;
  parentId: string | null;
}

export function NestedDataRow({ item, fields, modelId, level }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  // 新增：狀態追蹤「剛剛新增的內容區塊 ID」
const [justCreatedContentBlockId, setJustCreatedContentBlockId] = useState<string | null>(null);

  const handleSave = async (formData: FormData) => {
    const data: Record<string, any> = {};
    for (const field of fields) {
      const value = formData.get(field.key);
      if (field.type === 'number') data[field.key] = value ? Number(value) : null;
      else if (field.type === 'checkbox') data[field.key] = value === 'on';
      else if (field.type === 'multiselect') data[field.key] = formData.getAll(field.key);
      else if (field.type === 'image' && typeof value === 'string' && value.startsWith('data:')) {
        data[field.key] = value;
      } else data[field.key] = value || null;
    }

    await fetch('/api/models/' + modelId + '/data', {
      method: 'PATCH',
      body: JSON.stringify({ id: item.id, data }),
      headers: { 'Content-Type': 'application/json' },
    });

    setIsEditing(false);
  };

  const handleAddContentBlock = () => {
  startTransition(async () => {
    // 先建立一筆空的内容區塊（parentId = null, isContentBlock = true）
    const res = await fetch('/api/models/' + modelId + '/data', {
      method: 'POST',
      body: JSON.stringify({
        parentId: null,
        data: {},
        isContentBlock: true,
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    const newItem = await res.json();

    // 關鍵！記住這筆 ID，馬上讓它進入編輯模式！
    setJustCreatedContentBlockId(newItem.id);
  });
};

  const handleDelete = () => {
    if (!confirm('確定刪除此筆資料及其所有子項目？')) return;
    startTransition(() => deleteData(item.id));
  };

  const handleAddChild = () => {
    startTransition(() => createData(modelId, item.id));
  };

  // 修正：正確的語法！
  const handleAddRootColumn = () => {
    startTransition(() => {
      createData(modelId, null); // 新增根欄目
    });
  };

  return (
    <>
      {/* 主資料列 */}
      <tr className="border-b hover:bg-muted/30">
        {/* 第一格：展開按鈕 + 根欄目標籤 */}
        <td className="px-4 py-3">
          <div className="flex items-center gap-2">
            {item.children?.length > 0 && (
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7"
                onClick={() => setIsOpen(!isOpen)}
              >
                {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </Button>
            )}

            {/* 根欄目標籤 */}
            {item.parentId === null && level > 0 && (
              <Badge variant="outline" className="text-xs border-primary text-primary flex items-center gap-1">
                <FolderTree className="w-3 h-3" />
                根欄目
              </Badge>
            )}
          </div>
        </td>

        {/* 欄位顯示 */}
        {fields.map((field: any) => (
          <td key={field.key} className="px-4 py-3">
            {isEditing ? (
              <DynamicFieldInput field={field} name={field.key} defaultValue={item.data[field.key]} />
            ) : field.type === 'image' && item.data[field.key] ? (
              <img src={item.data[field.key]} alt="" className="h-12 w-12 object-cover rounded" />
            ) : (
              <span className="block max-w-xs truncate">
                {item.data[field.key] ?? '—'}
              </span>
            )}
          </td>
        ))}

        {/* 操作按鈕群 */}
  <td className="px-4 py-3 text-right space-x-1">
  {/* 新增子項目（規格樹） */}
  <Button size="icon" variant="outline" onClick={handleAddChild} disabled={isPending}>
    <Plus className="h-4 w-4" />
  </Button>

{/* 新增內容區塊 → 點擊後立刻跳出編輯表單！ */}
  <Button
    size="icon"
    variant="default"
    className="bg-emerald-600 hover:bg-emerald-700"
    onClick={handleAddContentBlock}
    disabled={isPending}
    title="新增內容區塊（會立刻跳出編輯表單）"
  >
    <LayoutPanelLeft className="h-4 w-4" />
  </Button>

          {/* 編輯與刪除 */}
          {!isEditing ? (
            <>
              <Button size="icon" variant="ghost" onClick={() => setIsEditing(true)}>
                <Edit2 className="h-4 h-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="text-destructive"
                onClick={handleDelete}
                disabled={isPending}
              >
                <Trash2 className="h-4 h-4" />
              </Button>
            </>
          ) : (
            <>
              <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>
                取消
              </Button>
              <Button form="edit-form" type="submit" size="sm">
                儲存
              </Button>
            </>
          )}
        </td>
      </tr>

      {/* 編輯模式 */}
      {isEditing && (
        <tr>
          <td colSpan={fields.length + 2} className="p-6 bg-muted/50">
            <form id="edit-form" action={handleSave}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {fields.map((field: any) => (
                  <div key={field.key}>
                    <label className="block text-sm font-medium mb-2">
                      {field.label}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    <DynamicFieldInput
                      field={field}
                      name={field.key}
                      defaultValue={item.data[field.key]}
                    />
                  </div>
                ))}
              </div>
            </form>
          </td>
        </tr>
      )}

{/* 編輯模式觸發條件 */}
{isEditing || justCreatedContentBlockId === item.id ? (
  <tr>
    <td colSpan={fields.length + 2} className="p-6 bg-emerald-50 border-2 border-emerald-300 rounded-lg">
      <form
        id="edit-form"
        action={async (formData) => {
          await handleSave(formData);
          setJustCreatedContentBlockId(null); // 儲存完就關閉
        }}
      >
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-emerald-800">新增內容區塊</h3>
          <p className="text-sm text-muted-foreground">填寫完畢後按「儲存」即出現在右側</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {fields.map((field: any) => (
            <div key={field.key}>
              <label className="block text-sm font-medium mb-2">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              <DynamicFieldInput
                field={field}
                name={field.key}
                defaultValue={item.data[field.key]}
              />
            </div>
          ))}
        </div>

        <div className="mt-6 flex gap-3">
          <Button type="submit">儲存內容區塊</Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setJustCreatedContentBlockId(null);
              setIsEditing(false);
              // 可選：刪除這筆空資料
              deleteData(item.id);
            }}
          >
            取消
          </Button>
        </div>
      </form>
    </td>
  </tr>
) : null}

      {/* 子層遞迴 */}
      {isOpen && item.children?.length > 0 && (
        <tr>
          <td colSpan={fields.length + 2} className="p-0 bg-muted/10">
            <NestedDataTable
              items={item.children}
              fields={fields}
              modelId={modelId}
              parentId={item.id}
              level={level + 1}
            />
          </td>
        </tr>
      )}
    </>
  );
}