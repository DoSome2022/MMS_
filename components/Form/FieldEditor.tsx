// components/Form/FieldEditor.tsx
'use client';

import { useState } from 'react';

type Field = {
  id?: string;
  label: string;
  key: string;
  type: 'text' | 'number' | 'select' | 'boolean';
  options?: string[];
  required?: boolean;
};

export function FieldEditor({
  initialFields,
  modelId,
  onSuccess,
}: {
  initialFields: Field[];
  modelId: string | null;
  onSuccess: () => void;
}) {
  const [fields, setFields] = useState<Field[]>(initialFields);

  const addField = () => {
    setFields([...fields, {
      label: '',
      key: '',
      type: 'text',
      required: false,
    }]);
  };

  const updateField = (index: number, field: Partial<Field>) => {
    const newFields = [...fields];
    newFields[index] = { ...newFields[index], ...field };
    setFields(newFields);
  };

  const removeField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index));
  };

const save = async () => {
  // 檢查必填欄位
  for (const f of fields) {
    if (!f.label || !f.key) {
      alert('請填寫完整欄位名稱與 key');
      return;
    }
  }

  const payload: any = {
    fields: fields.map(f => ({
      id: f.id,
      label: f.label,
      key: f.key,
      type: f.type,
      options: f.type === 'select' ? (f.options || []) : undefined,
      required: f.required || false,
    })),
  };

  if (modelId) {
    // 編輯模式 → PATCH
    payload.id = modelId;
  } else {
    // 新建模式 → POST
    payload.aId = prompt('請輸入商品 ID (aId)', '21101e3c-c175-4a85-aa00-6da58af09ccb') 
                 || '21101e3c-c175-4a85-aa00-6da58af09ccb';
    payload.name = prompt('規格表名稱？', '顏色') || '未命名';
  }

  const res = await fetch('/api/dynamic-model', {
    method: modelId ? 'PATCH' : 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (res.ok) {
    alert('儲存成功！');
    onSuccess();
  } else {
    const err = await res.text();
    alert('儲存失敗：' + err);
  }
};
  return (
    <div className="space-y-4">
      {fields.map((field, i) => (
        <div key={i} className="p-4 bg-white rounded-lg border shadow-sm">
          <div className="grid grid-cols-2 gap-3">
            <input
              placeholder="欄位名稱（如：顏色）"
              value={field.label}
              onChange={(e) => updateField(i, { label: e.target.value })}
              className="px-3 py-2 border rounded"
            />
            <input
              placeholder="key（如：color）"
              value={field.key}
              onChange={(e) => updateField(i, { key: e.target.value.replace(/[^a-zA-Z0-9_]/g, '') })}
              className="px-3 py-2 border rounded text-sm"
            />
            <select
              value={field.type}
              onChange={(e) => updateField(i, { type: e.target.value as any })}
              className="px-3 py-2 border rounded"
            >
              <option value="text">文字</option>
              <option value="number">數字</option>
              <option value="select">選單</option>
              <option value="boolean">開關</option>
            </select>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={field.required}
                onChange={(e) => updateField(i, { required: e.target.checked })}
                className="mr-2"
              />
              必填
            </label>
          </div>

          {field.type === 'select' && (
            <div className="mt-2">
              <input
                placeholder="選項（用逗號分隔）"
                onChange={(e) => updateField(i, { options: e.target.value.split(',') })}
                className="w-full px-3 py-2 border rounded text-sm"
              />
            </div>
          )}

          <button
            onClick={() => removeField(i)}
            className="mt-2 text-red-500 text-sm hover:underline"
          >
            刪除
          </button>
        </div>
      ))}

      <div className="flex gap-3">
        <button
          onClick={addField}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          + 新增欄位
        </button>

        <button
          onClick={save}
          className="px-6 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 font-medium"
        >
          儲存規格表
        </button>
      </div>
    </div>
  );
}