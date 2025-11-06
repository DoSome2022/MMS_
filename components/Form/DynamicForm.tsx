// components/Form/DynamicForm.tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useState } from 'react';
import { FieldEditor } from './FieldEditor';

type Field = {
  id?: string;
  label: string;
  key: string;
  type: 'text' | 'number' | 'select' | 'boolean';
  options?: string[];
  required?: boolean;
};

type Model = {
  id: string;
  name: string;
  fields: Field[];
};

export function DynamicForm({
  model,
  onSuccess,
  parentDataId,
}: {
  model: Model | null;
  onSuccess: () => void;
  parentDataId?: string | null;
}) {
  const [isEditingFields, setIsEditingFields] = useState(false);

  // ==================== 模式 1：新增資料 ====================
  if (model && !isEditingFields) {
    // 防禦：確保 fields 存在
    if (!model.fields || !Array.isArray(model.fields)) {
      return (
        <div className="p-8 bg-yellow-50 rounded-lg text-center">
          <p className="text-yellow-800">欄位載入中或尚未建立欄位</p>
        </div>
      );
    }

    // 動態建立 Zod Schema
    const schemaObj = model.fields.reduce((acc, field) => {
      let validator: z.ZodTypeAny;

      switch (field.type) {
        case 'text':
          validator = z.string();
          break;
        case 'number':
          validator = z.coerce.number();
          break;
        case 'select':
          validator = field.options?.length
            ? z.enum(field.options as [string, ...string[]])
            : z.string();
          break;
        case 'boolean':
          validator = z.boolean();
          break;
        default:
          validator = z.any();
      }

      if (field.required) {
        if (field.type === 'text' || field.type === 'select') {
          validator = (validator as z.ZodString).nonempty({
            message: `${field.label} 必填`,
          });
        } else if (field.type === 'number') {
          validator = (validator as z.ZodNumber).refine(
            (v) => v !== null && !isNaN(v),
            { message: `${field.label} 必填` }
          );
        }
      } else {
        validator = validator.optional().or(z.literal(''));
      }

      acc[field.key] = validator;
      return acc;
    }, {} as Record<string, z.ZodTypeAny>);

    const schema = z.object(schemaObj);
    type FormData = z.infer<typeof schema>;

    const {
      register,
      handleSubmit,
      formState: { errors },
      reset,
    } = useForm<FormData>({
      resolver: zodResolver(schema),
    });

    const onSubmit = async (data: FormData) => {
      try {
        const res = await fetch(`/api/dynamic-model/${model.id}/data`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...data,
            parentId: parentDataId || null, // 關鍵：傳遞 parentId
          }),
        });

        if (!res.ok) {
          const err = await res.text();
          throw new Error(err || '新增失敗');
        }

        reset();
        onSuccess();
      } catch (err: any) {
        alert('新增失敗：' + err.message);
      }
    };

    return (
      <div className="mt-8">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-gray-800">新增資料</h3>
          <button
            type="button"
            onClick={() => setIsEditingFields(true)}
            className="text-blue-600 hover:underline text-sm font-medium"
          >
            ✏️ 編輯欄位結構
          </button>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="p-6 bg-white rounded-xl shadow-sm border border-gray-200 space-y-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {model.fields.map((field) => (
              <div key={field.id || field.key}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </label>

                {field.type === 'text' && (
                  <input
                    {...register(field.key)}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    placeholder={`請輸入 ${field.label}`}
                  />
                )}

                {field.type === 'number' && (
                  <input
                    type="number"
                    {...register(field.key)}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                )}

                {field.type === 'select' && field.options && (
                  <select
                    {...register(field.key)}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">請選擇 {field.label}</option>
                    {field.options.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                )}

                {field.type === 'boolean' && (
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      {...register(field.key)}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-gray-700">啟用</span>
                  </div>
                )}

                {errors[field.key] && (
                  <p className="text-red-500 text-xs mt-1">
                    {(errors[field.key] as any)?.message || '請修正此欄位'}
                  </p>
                )}
              </div>
            ))}
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 font-medium transition shadow-md"
          >
            確認新增
          </button>
        </form>
      </div>
    );
  }

  // ==================== 模式 2：編輯欄位結構 ====================
  return (
    <div className="mt-8 p-8 bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 rounded-2xl border-2 border-purple-200">
      <h3 className="text-2xl font-bold text-purple-800 mb-6 flex items-center gap-3">
        {model ? `編輯規格表：${model.name}` : '建立第一個欄位'}
      </h3>

      <FieldEditor
        initialFields={model?.fields || []}
        modelId={model?.id || null}
        onSuccess={() => {
          setIsEditingFields(false);
          onSuccess();
        }}
      />

      {model && (
        <button
          onClick={() => setIsEditingFields(false)}
          className="mt-6 text-purple-700 hover:underline font-medium"
        >
          ← 返回新增資料
        </button>
      )}
    </div>
  );
}