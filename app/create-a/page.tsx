// app/create-a/page.tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const schema = z.object({
  title: z.string().min(1, '商品名稱必填'),
  desc: z.string().optional(),
  category: z.string().min(1, '分類必填'),
  price: z.string().refine((v) => !isNaN(Number(v)) && Number(v) > 0, {
    message: '價格必須為正數',
  }),
  image: z.string().url('請輸入有效圖片網址').optional().or(z.literal('')),
});

type FormData = z.infer<typeof schema>;

export default function CreateProductPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/a', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          price: data.price,
        }),
      });

      if (!res.ok) throw new Error();

      const newA = await res.json();
      router.push(`/a/${newA.id}`); // 跳轉到詳情頁
    } catch {
      alert('建立失敗，請重試');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-md p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
          新增商品
        </h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* 商品名稱 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              商品名稱 <span className="text-red-500">*</span>
            </label>
            <input
              {...register('title')}
              className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="例如：iPhone 16 Pro"
            />
            {errors.title && (
              <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>
            )}
          </div>

          {/* 描述 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              描述
            </label>
            <textarea
              {...register('desc')}
              rows={3}
              className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
              placeholder="選填"
            />
          </div>

          {/* 分類 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              分類 <span className="text-red-500">*</span>
            </label>
            <select
              {...register('category')}
              className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
            >
              <option value="">請選擇分類</option>
              <option value="手機">手機</option>
              <option value="筆電">筆電</option>
              <option value="平板">平板</option>
              <option value="配件">配件</option>
            </select>
            {errors.category && (
              <p className="text-red-500 text-xs mt-1">{errors.category.message}</p>
            )}
          </div>

          {/* 價格 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              價格 <span className="text-red-500">*</span>
            </label>
            <input
              {...register('price')}
              type="number"
              step="0.01"
              className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
              placeholder="例如：39900"
            />
            {errors.price && (
              <p className="text-red-500 text-xs mt-1">{errors.price.message}</p>
            )}
          </div>

          {/* 圖片 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              圖片網址
            </label>
            <input
              {...register('image')}
              className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
              placeholder="https://example.com/image.jpg"
            />
            {errors.image && (
              <p className="text-red-500 text-xs mt-1">{errors.image.message}</p>
            )}
          </div>

          {/* 提交按鈕 */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-70 transition-colors"
          >
            {isSubmitting ? '建立中...' : '建立商品'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => router.push('/')}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            返回首頁
          </button>
        </div>
      </div>
    </div>
  );
}