// components/NestedDataItem.tsx
'use client';

import { DynamicFieldInput } from './DynamicFieldInput';
import { Button } from '@/components/ui/button';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Trash2, Plus, Save, X } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation'; // ← 新增這行


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
}

export function NestedDataItem({ data, fields, modelId, parentId, level = 0 }: Props) {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(data.data);
  const router = useRouter(); // ← 新增

  // 修改
  const updateMutation = useMutation({
    mutationFn: (updates: { id: string; data: any }) =>
      fetch(`/api/models/${modelId}/data`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      }).then((res) => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['data', modelId, parentId] });
      setIsEditing(false);
    },
  });

// 刪除 Mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      fetch(`/api/models/${modelId}/data`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      }).then((res) => res.json()),
    
    // 成功後：強制重新載入頁面
    onSuccess: () => {
      router.refresh(); // ← Next.js 15 推薦方式：只重新執行 Server Component
      // 或使用： window.location.reload(); // 完整硬刷新
      window.location.reload();
    },

    // 可選：錯誤處理
    onError: (error) => {
      alert('刪除失敗，請重試');
      console.error(error);
    },
  });

  // 新增子項目
  const createChild = useMutation({
    mutationFn: () =>
      fetch(`/api/models/${modelId}/data`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ parentId: data.id, data: {} }),
      }).then((res) => res.json()),
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

  return (
    <div
      className={`border rounded-lg p-4 space-y-4 ${level > 0 ? 'ml-8 border-dashed' : ''}`}
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
                onChange={(value) => setEditData({ ...editData, [field.key]: value })}
              />
            ) : (
              <div className="p-2 bg-muted rounded">
                {field.type === 'image' && editData[field.key] ? (
                  <img src={editData[field.key]} alt="" className="w-20 h-20 object-cover rounded" />
                ) : (
                  <span className="text-sm">
                    {editData[field.key] !== undefined ? String(editData[field.key]) : '—'}
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
            <Button size="sm" onClick={handleSave} disabled={updateMutation.isPending}>
              <Save className="w-4 h-4 mr-1" />
              儲存
            </Button>
            <Button size="sm" variant="outline" onClick={handleCancel}>
              <X className="w-4 h-4 mr-1" />
              取消
            </Button>
          </>
        ) : (
          <>
            <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>
              編輯
            </Button>
            <Button size="sm" onClick={() => createChild.mutate()}>
              <Plus className="w-4 h-4 mr-1" />
              新增子項目
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => {
                if (confirm('確定刪除此項目及其所有子項目？')) {
                  deleteMutation.mutate(data.id);
                }
              }}
              disabled={deleteMutation.isPending}
            >
              <Trash2 className="w-4 h-4" />
              {deleteMutation.isPending ? '刪除中...' : ''}
            </Button>
          </>
        )}
      </div>

      {/* 遞迴子層 */}
      <div className="mt-4">
        {data.children.map((child) => (
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