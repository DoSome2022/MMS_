// components/DynamicForm.tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

type Field = {
  id: string;
  label: string;
  key: string;
  type: 'text' | 'number' | 'select' | 'boolean';
  options?: string[];
  required: boolean;
};

type Model = {
  id: string;
  fields: Field[];
};

export function DynamicForm({ model, onSuccess }: { model: Model; onSuccess: () => void }) {
  // 動態建立 Zod Schema
  const schemaObj = model.fields.reduce((acc, field) => {
    let validator: z.ZodTypeAny;

    // 依 type 建立基礎驗證器
    switch (field.type) {
      case 'text':
        validator = z.string();
        break;
      case 'number':
        validator = z.coerce.number();
        break;
      case 'select':
        if (field.options && field.options.length > 0) {
          validator = z.enum(field.options as [string, ...string[]]);
        } else {
          validator = z.string(); // fallback
        }
        break;
      case 'boolean':
        validator = z.boolean();
        break;
      default:
        validator = z.any();
    }

    // 必填處理：精確型別 + 明確檢查
    if (field.required) {
      if (field.type === 'text' || field.type === 'select') {
        validator = (validator as z.ZodString).nonempty({ message: `${field.label} 必填` });
      } else if (field.type === 'number') {
        validator = (validator as z.ZodNumber).refine(
          (v: number) => v !== null && !isNaN(v),
          { message: `${field.label} 必填` }
        );
      } else if (field.type === 'boolean') {
        // boolean 必填通常不需要額外檢查
      }
    } else {
      // 非必填：允許 undefined
      if (field.type === 'text' || field.type === 'select') {
        validator = (validator as z.ZodString).optional().or(z.literal(''));
      } else if (field.type === 'number') {
        validator = (validator as z.ZodNumber).optional().or(z.literal(''));
      }
    }

    acc[field.key] = validator;
    return acc;
  }, {} as Record<string, z.ZodTypeAny>);

  const schema = z.object(schemaObj);

  // 明確指定表單資料型別
  type FormData = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      const res = await fetch(`/api/dynamic-model/${model.id}/data`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error('Failed');
      onSuccess();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-4 bg-gray-50 rounded-lg">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {model.fields.map((field) => (
          <div key={field.id}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>

            {/* Text */}
            {field.type === 'text' && (
              <input
                {...register(field.key)}
                className="border rounded-md p-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder={field.label}
              />
            )}

            {/* Number */}
            {field.type === 'number' && (
              <input
                type="number"
                {...register(field.key)}
                className="border rounded-md p-2 w-full focus:ring-2 focus:ring-blue-500"
              />
            )}

            {/* Select */}
            {field.type === 'select' && field.options && (
              <select
                {...register(field.key)}
                className="border rounded-md p-2 w-full focus:ring-2 focus:ring-blue-500"
              >
                <option value="">請選擇 {field.label}</option>
                {field.options.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            )}

            {/* Boolean */}
            {field.type === 'boolean' && (
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  {...register(field.key)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-sm">啟用</span>
              </div>
            )}

            {/* 錯誤訊息 */}
            {errors[field.key] && (
              <p className="text-red-500 text-xs mt-1">
                {errors[field.key]?.message ?? '輸入無效'}
              </p>
            )}
          </div>
        ))}
      </div>

      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors font-medium"
      >
        新增資料
      </button>
    </form>
  );
}