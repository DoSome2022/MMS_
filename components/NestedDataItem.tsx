// components/NestedDataItem.tsx
'use client';

import { DynamicFieldInput } from './DynamicFieldInput';
import { Button } from '@/components/ui/button';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Trash2, Plus, Save, X, Edit2 } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

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
  data: Data;
  fields: Field[];
  modelId: string;
  parentId?: string;
  level?: number;
  inline?: boolean; // 新增：用於表格行內操作
}

export function NestedDataItem({
  data,
  fields,
  modelId,
  parentId,
  level = 0,
  inline = false,
}: Props) {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(data.data);
  const router = useRouter();

  // === 更新 ===
  const updateMutation = useMutation({
    mutationFn: (updates: { id: string; data: any }) =>
      fetch(`/api/models/${modelId}/data`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      }).then((res) => {
        if (!res.ok) throw new Error('更新失敗');
        return res.json();
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['data', modelId, parentId] });
      setIsEditing(false);
    },
    onError: () => alert('儲存失敗，請重試'),
  });

  // === 刪除 ===
  const deleteMutation = useMutation({
    mutationFn: () =>
      fetch(`/api/models/${modelId}/data`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: data.id }),
      }).then((res) => {
        if (!res.ok) throw new Error('刪除失敗');
        return res.json();
      }),
    onSuccess: () => {
      router.refresh(); // Next.js 15 推薦：重新執行 Server Component
      queryClient.invalidateQueries({ queryKey: ['data', modelId, parentId] });
    },
  });

  // === 新增子項目 ===
  const createChild = useMutation({
    mutationFn: () =>
      fetch(`/api/models/${modelId}/data`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ parentId: data.id, data: {} }),
      }).then((res) => {
        if (!res.ok) throw new Error('新增失敗');
        return res.json();
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['data', modelId, data.id] });
    },
  });

  const handleSave = () => {
    updateMutation.mutate({ id: data.id, data: editData });
  };

  const handleCancel = () => {
    setEditData(data.data);
    setIsEditing(false);
  };

  // === 表格行內模式（inline）===
  if (inline) {
    return (
      <div className="flex items-center gap-1">
        <Button
          size="icon"
          variant="ghost"
          className="h-7 w-7"
          onClick={() => setIsEditing(true)}
          disabled={updateMutation.isPending}
        >
          <Edit2 className="w-3.5 h-3.5" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className="h-7 w-7 text-destructive"
          onClick={() => {
            if (confirm('確定刪除此項目及其所有子項目？')) {
              deleteMutation.mutate();
            }
          }}
          disabled={deleteMutation.isPending}
        >
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      </div>
    );
  }

  // === 完整卡片模式（原 UI）===
  return (
    <div
      className={`border rounded-lg p-4 space-y-4 ${
        level > 0 ? 'ml-8 border-dashed' : ''
      } bg-card`}
      style={{ marginLeft: `${level * 2}rem` }}
    >
      {/* 表單欄位 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {fields.map((field) => (
          <div key={field.key}>
            <label className="block text-sm font-medium mb-1">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            {isEditing ? (
              <DynamicFieldInput
                field={field}
                value={editData[field.key]}
                onChange={(value) =>
                  setEditData({ ...editData, [field.key]: value })
                }
              />
            ) : (
              <div className="p-2 bg-muted rounded min-h-[2.5rem] flex items-center">
                {field.type === 'image' && editData[field.key] ? (
                  <img
                    src={editData[field.key]}
                    alt={field.label}
                    className="w-16 h-16 object-cover rounded"
                  />
                ) : (
                  <span className="text-sm">
                    {editData[field.key] !== undefined
                      ? String(editData[field.key])
                      : '—'}
                  </span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 按鈕群組 */}
      <div className="flex gap-2 flex-wrap">
        {isEditing ? (
          <>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={updateMutation.isPending}
            >
              <Save className="w-4 h-4 mr-1" />
              {updateMutation.isPending ? '儲存中...' : '儲存'}
            </Button>
            <Button size="sm" variant="outline" onClick={handleCancel}>
              <X className="w-4 h-4 mr-1" />
              取消
            </Button>
          </>
        ) : (
          <>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsEditing(true)}
            >
              <Edit2 className="w-4 h-4 mr-1" />
              編輯
            </Button>
            <Button
              size="sm"
              onClick={() => createChild.mutate()}
              disabled={createChild.isPending}
            >
              <Plus className="w-4 h-4 mr-�1" />
              {createChild.isPending ? '新增中...' : '新增子項目'}
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => {
                if (confirm('確定刪除此項目及其所有子項目？')) {
                  deleteMutation.mutate();
                }
              }}
              disabled={deleteMutation.isPending}
            >
              <Trash2 className="w-4 h-4 mr-1" />
              {deleteMutation.isPending ? '刪除中...' : '刪除'}
            </Button>
          </>
        )}
      </div>

      {/* 遞迴子層 */}
      <div className="mt-4">
        {Array.isArray(data.children) &&
          data.children.map((child) => (
            <NestedDataItem
              key={child.id}
              data={child}
              fields={fields}
              modelId={modelId}
              parentId={data.id}
              level={level + 1}
            />
          ))}
      </div>
    </div>
  );
}