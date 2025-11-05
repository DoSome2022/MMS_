// components/ModelBlock.tsx
'use client';

import { useState } from 'react';
import { DynamicForm } from '../Form/DynamicForm';



const fetcher = (url: string) => fetch(url).then(r => r.json());

type Model = {
  id: string;
  name: string;
  fields: any[];
  dataRows?: any[];
};

type ModelBlockProps = {
  model: Model;
  aId: string;               // 商品 id，用來重新取得全部模型
  onRefresh: () => void;     // 父層的 mutate
};

export function ModelBlock({ model, aId, onRefresh }: ModelBlockProps) {
  const [importing, setImporting] = useState(false);

  /* ──────── 複製模型 ──────── */
  const handleCopy = async () => {
    if (!confirm(`確定要複製「${model.name}」？`)) return;
    const res = await fetch(`/api/dynamic-model/${model.id}/copy`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newName: `${model.name} (複製)` }),
    });
    if (res.ok) {
      onRefresh();
      alert('模型已複製');
    } else alert('複製失敗');
  };

  /* ──────── 匯出 JSON ──────── */
  const handleExport = async () => {
    const res = await fetch(`/api/dynamic-model/${model.id}/export`);
    const data = await res.json();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${model.name}.json`;
    a.click();
  };

  /* ──────── 匯入 JSON ──────── */
  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!confirm(`匯入將 **覆蓋**「${model.name}」的欄位設定，確定？`)) return;

    setImporting(true);
    try {
      const text = await file.text();
      const json = JSON.parse(text);

      const res = await fetch(`/api/dynamic-model/${model.id}/import`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(json),
      });

      if (res.ok) {
        onRefresh();
        alert('匯入成功');
      } else alert('匯入失敗');
    } catch (err) {
      alert('檔案格式錯誤');
    } finally {
      setImporting(false);
      e.target.value = ''; // 讓同一檔案可再次觸發
    }
  };

  return (
    <section className="mb-12 border rounded-lg p-5 bg-white shadow-sm">
      {/* ── 標題 + 按鈕 ── */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-blue-700">{model.name}</h2>

        <div className="flex gap-2">
          {/* 複製 */}
          <button
            onClick={handleCopy}
            className="px-3 py-1 text-sm text-white bg-indigo-600 rounded hover:bg-indigo-700 transition"
          >
            複製模型
          </button>

          {/* 匯出 */}
          <button
            onClick={handleExport}
            className="px-3 py-1 text-sm text-white bg-green-600 rounded hover:bg-green-700 transition"
          >
            匯出 JSON
          </button>

          {/* 匯入 */}
          <label className="flex items-center px-3 py-1 text-sm text-white bg-purple-600 rounded hover:bg-purple-700 cursor-pointer transition">
            {importing ? '匯入中…' : '匯入 JSON'}
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              disabled={importing}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* ── 資料表格（若有）── */}
      {model.dataRows && model.dataRows.length > 0 ? (
        <table className="w-full mb-4 text-sm border-collapse">
          <thead>
            <tr className="bg-gray-50">
              {model.fields.map(f => (
                <th key={f.id} className="p-2 text-left border">
                  {f.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {model.dataRows.map((row: any) => (
              <tr key={row.id} className="hover:bg-gray-50">
                {model.fields.map(f => (
                  <td key={f.id} className="p-2 border">
                    {row.data[f.key] !== undefined ? String(row.data[f.key]) : '-'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="mb-4 text-sm text-gray-500">尚未有資料</p>
      )}

      {/* ── 新增資料表單 ── */}
      <DynamicForm model={model} onSuccess={onRefresh} />
    </section>
  );
}