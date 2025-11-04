// components/ModelCreator.tsx
'use client';

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const fieldSchema = z.object({
  label: z.string().min(1, '欄位名稱必填'),
  key: z.string().min(1, '鍵名必填').regex(/^[a-zA-Z0-9_]+$/, '僅限字母數字下劃線'),
  type: z.enum(['text', 'number', 'select', 'boolean']),
  options: z.string().optional(),
  required: z.boolean(), // 必須是 boolean，不是 optional
});

const schema = z.object({
  name: z.string().min(1, '模型名稱必填'),
  fields: z.array(fieldSchema).min(1, '至少一個欄位'),
});

type FormData = z.infer<typeof schema>;

type ModelCreatorProps = {
  aId: string;
  onSuccess: () => void;
};

export function ModelCreator({ aId, onSuccess }: ModelCreatorProps) {
  const [show, setShow] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      fields: [
        {
          label: '',
          key: '',
          type: 'text' as const,
          required: false,
          options: undefined,
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'fields',
  });

  const onSubmit = async (data: FormData) => {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/a/${aId}/model`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          fields: data.fields.map((f) => ({
            ...f,
            options: f.type === 'select' ? f.options?.split(',').map((o) => o.trim()).filter(Boolean) || null : null,
          })),
        }),
      });

      if (!res.ok) throw new Error('建立失敗');
      reset();
      setShow(false);
      onSuccess();
    } catch (err) {
      alert(err instanceof Error ? err.message : '建立失敗');
    } finally {
      setSubmitting(false);
    }
  };

  if (!show) {
    return (
      <button
        onClick={() => setShow(true)}
        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
      >
        + 新增規格表
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl font-bold mb-4">建立新模型</h3>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block font-medium mb-1">模型名稱 *</label>
            <input
              {...register('name')}
              className="w-full border rounded p-2 focus:ring-2 focus:ring-blue-500"
              placeholder="例如：規格表、屬性、變體"
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="font-medium">欄位</label>
              <button
                type="button"
                onClick={() => append({ label: '', key: '', type: 'text', required: false })}
                className="text-sm text-blue-600 hover:underline"
              >
                + 新增欄位
              </button>
            </div>

            {fields.map((field, index) => (
              <div key={field.id} className="border rounded p-3 mb-3 space-y-2 bg-gray-50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <input
                    {...register(`fields.${index}.label`)}
                    placeholder="顯示名稱"
                    className="border rounded p-1 text-sm"
                  />
                  <input
                    {...register(`fields.${index}.key`)}
                    placeholder="鍵名 (key)"
                    className="border rounded p-1 text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <select
                    {...register(`fields.${index}.type`)}
                    className="border rounded p-1 text-sm"
                  >
                    <option value="text">文字</option>
                    <option value="number">數字</option>
                    <option value="select">下拉選單</option>
                    <option value="boolean">是/否</option>
                  </select>

                  <label className="flex items-center space-x-1 text-sm">
                    <input
                      type="checkbox"
                      {...register(`fields.${index}.required`)}
                      className="w-4 h-4"
                    />
                    <span>必填</span>
                  </label>
                </div>

                {/* 動態顯示 options 輸入框 */}
                {field.type === 'select' && (
                  <input
                    {...register(`fields.${index}.options`)}
                    placeholder="選項用逗號分隔：紅,藍,綠"
                    className="w-full border rounded p-1 text-sm"
                  />
                )}

                {/* // components/ModelCreator.tsx (關鍵修改) */}
                    {field.type === 'model' && (
                    <select
                        {...register(`fields.${index}.refModelId`)}
                        className="w-full border rounded p-1 text-sm"
                    >
                        <option value="">選擇子模型</option>
                        {availableModels.map(m => (
                        <option key={m.id} value={m.id}>
                            {m.name} (ID: {m.id.slice(0, 8)})
                        </option>
                        ))}
                    </select>
                    )}


                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="text-xs text-red-500 hover:underline"
                >
                  移除欄位
                </button>

                {errors.fields?.[index] && (
                  <p className="text-red-500 text-xs">
                    {errors.fields[index]?.label?.message || 
                     errors.fields[index]?.key?.message ||
                     errors.fields[index]?.type?.message}
                  </p>
                )}
              </div>
            ))}
          </div>

          <div className="flex gap-2 justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-70 transition-colors"
            >
              {submitting ? '建立中...' : '建立模型'}
            </button>
            <button
              type="button"
              onClick={() => {
                setShow(false);
                reset();
              }}
              className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400 transition-colors"
            >
              取消
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}