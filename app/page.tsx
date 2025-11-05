// app/page.tsx
"use client";

import Link from "next/link";
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function Home() {
  const { data, error, isLoading } = useSWR(`/api/a/allDataLists`, fetcher);

  if (error) return <div className="text-red-500">載入失敗</div>;
  if (isLoading) return <div className="text-gray-500">載入中...</div>;

  const products = data || []; // 防 undefined

  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <Link href="/create-a" className="bg-green-600 text-white px-4 py-2 rounded">
        + 新增商品
      </Link>

      <div className="w-full max-w-2xl">
        <h2 className="text-xl font-bold mb-4">商品列表</h2>

        {products.length > 0 ? (
          products.map((d: any) => (
            <Link
              key={d.id}
              href={`/a/${d.id}`}
              className="block p-3 border-b hover:bg-gray-50 transition"
            >
              <div className="font-medium">{d.title}</div>
              <div className="text-sm text-gray-600">{d.desc}</div>
              <div className="text-sm font-semibold text-green-600">NT${d.price}</div>
            </Link>
          ))
        ) : (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg mb-4">尚未有任何商品</p>
            <Link href="/create-a" className="text-blue-600 hover:underline">
              點此建立第一筆商品
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}