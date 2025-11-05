// app/a/[...slug]/page.tsx
'use client';

import { DynamicFormTree } from '@/components/Form/DynamicFormTree';
import { use } from 'react';
import useSWR from 'swr';
import Link from 'next/link';
import { useState } from 'react';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function DynamicPage({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = use(params);
  const [showCreateModel, setShowCreateModel] = useState(false);
  const [newModelName, setNewModelName] = useState('');

  // 判斷第一段是 id 還是 slug
  const first = slug[0];
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(first);

  const apiPath = isUUID
    ? `/api/a/${first}`
    : `/api/a/path/${slug.join('/')}`;

  // 解構 mutate！
  const { data, error, mutate } = useSWR(apiPath, fetcher);

  if (error) return <div className="p-8 text-red-500">載入失敗</div>;
  if (!data) return <div className="p-8 text-gray-500">載入中...</div>;

  // === 關鍵：支援三種狀態 ===
  const isProductRoot = data.type === 'product-root' && data.product;
  const isDynamicPath = data.type === 'dynamic-path' && data.currentModel?.id;
  const isModelMissing = !isProductRoot && !isDynamicPath;

  // === 麵包屑 ===
  const breadcrumbs = data.breadcrumbs || slug;

  const handleCreateModel = async () => {
    if (!newModelName.trim()) return;

    try {
      const res = await fetch(`/api/dynamic-model`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newModelName,
          aId: data.product.id,
        }),
      });

      if (res.ok) {
        setShowCreateModel(false);
        setNewModelName('');
        mutate(); // 重新載入資料
      } else {
        alert('建立失敗');
      }
    } catch (err) {
      alert('網路錯誤');
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* 麵包屑 */}
      <nav className="mb-6 text-sm">
        <a href="/" className="text-blue-600 hover:underline">首頁</a>
        {breadcrumbs.map((s: string, i: number) => (
          <span key={i}>
            {' > '}
            <a
              href={`/a/${slug.slice(0, i + 1).join('/')}`}
              className="text-blue-600 hover:underline"
            >
              {s}
            </a>
          </span>
        ))}
      </nav>

      {/* === 1. 商品根頁面 === */}
      {isProductRoot && (
        <>
          <h1 className="mb-4 text-2xl font-bold">{data.product.title}</h1>
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div>
              {data.product.image && (
                <img
                  src={data.product.image}
                  alt={data.product.title}
                  className="w-full h-64 object-cover rounded-lg"
                />
              )}
            </div>
            <div>
              <p className="text-gray-700 mb-2">{data.product.desc}</p>
              <p className="text-2xl font-bold text-green-600">NT${data.product.price}</p>
              <p className="text-sm text-gray-500">分類：{data.product.category}</p>
            </div>
          </div>

          {/* === 規格表區塊 === */}
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">規格表</h2>
              <button
                onClick={() => setShowCreateModel(true)}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
              >
                + 新增規格表
              </button>
            </div>

            {/* === 建立規格表表單 === */}
            {showCreateModel && (
              <div className="p-4 bg-white border rounded-lg shadow-sm">
                <h3 className="text-lg font-medium mb-3">建立新規格表</h3>
                <input
                  type="text"
                  placeholder="規格表名稱（如：顏色、容量）"
                  value={newModelName}
                  onChange={(e) => setNewModelName(e.target.value)}
                  className="w-full p-2 border rounded mb-3"
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleCreateModel}
                    disabled={!newModelName.trim()}
                    className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
                  >
                    建立
                  </button>
                  <button
                    onClick={() => {
                      setShowCreateModel(false);
                      setNewModelName('');
                    }}
                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded"
                  >
                    取消
                  </button>
                </div>
              </div>
            )}

            {/* === 規格表列表 === */}
            {data.product.dynamicModels?.length > 0 ? (
              data.product.dynamicModels.map((model: any) => (
                <div
                  key={model.id}
                  className="p-4 bg-blue-50 rounded-lg border border-blue-200"
                >
                  <Link
                    href={`/a/${slug.join('/')}/${model.name}`}
                    className="text-lg font-medium text-blue-600 hover:underline"
                  >
                    {model.name} →
                  </Link>
                </div>
              ))
            ) : (
              <p className="text-gray-500">尚未建立規格表</p>
            )}
          </div>
        </>
      )}

      {/* === 2. 動態層級頁面 === */}
      {isDynamicPath && (
        <>
          <h1 className="mb-4 text-2xl font-bold">
            {data.isDataRow ? data.currentData?.displayName || '資料' : data.currentModel.name}
          </h1>

          <DynamicFormTree
            modelId={data.currentModel.id}
            currentPath={slug}
            isDataRow={data.isDataRow}
          />
        </>
      )}

      {/* === 3. 模型不存在 === */}
      {isModelMissing && (
        <>
          <h1 className="mb-4 text-2xl font-bold">模型不存在</h1>
          <p className="text-gray-600">請檢查路徑是否正確，或建立此模型。</p>
        </>
      )}
    </div>
  );
}