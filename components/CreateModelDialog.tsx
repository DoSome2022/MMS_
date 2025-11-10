// components/CreateModelForm.tsx
'use client';

import { useState, useTransition, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { createDynamicModel } from '@/app/actions/createModel';
import { createCategory, deleteCategory } from '@/app/actions/categoryActions';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Category {
  id: string;
  title: string;
}

interface Field {
  label: string;
  key: string;
  type: 'text' | 'number' | 'select' | 'image' | 'textarea' | 'date';
  options: string;
  required: boolean;
}

interface Props {
  categories: Category[];
}

export function CreateModelForm({ categories: initialCategories }: Props) {
  const [isPending, startTransition] = useTransition();
  const [fields, setFields] = useState<Field[]>([
    { label: '', key: '', type: 'text', options: '', required: false },
  ]);
  const [name, setName] = useState('');
  const [aId, setAId] = useState('');
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [newCatTitle, setNewCatTitle] = useState('');
  const [isAddingCat, setIsAddingCat] = useState(false);
  const router = useRouter();

  useEffect(() => {
    console.log('🔄 [CreateModelForm] 接收初始分類:', initialCategories);
    setCategories(initialCategories);
  }, [initialCategories]);

  const addField = () => {
    console.log('➕ 新增欄位');
    setFields([...fields, { label: '', key: '', type: 'text', options: '', required: false }]);
  };

  const removeField = (index: number) => {
    console.log('🗑️ 移除欄位', index);
    setFields(fields.filter((_, i) => i !== index));
  };

  const updateField = (index: number, field: Partial<Field>) => {
    const newFields = [...fields];
    newFields[index] = { ...newFields[index], ...field };
    setFields(newFields);
  };

  const handleCreateCategory = () => {
    const title = newCatTitle.trim();
    if (!title) {
      console.warn('⚠️ 分類名稱為空');
      return;
    }
    console.log('📌 建立分類:', title);
    startTransition(async () => {
      const result = await createCategory(title);
      if ('success' in result && result.category) {
        console.log('✅ 分類建立成功:', result.category);
        setCategories(prev => [...prev, result.category]);
        setNewCatTitle('');
        setIsAddingCat(false);
      } else {
        console.error('❌ 分類建立失敗:', result.error);
        alert(result.error || '建立失敗');
      }
    });
  };

  const handleDeleteCategory = (id: string, title: string) => {
    console.log('🗑️ 刪除分類:', { id, title });
    if (!confirm(`確定刪除分類「${title}」？`)) {
      console.log('❌ 使用者取消刪除');
      return;
    }
    startTransition(async () => {
      const result = await deleteCategory(id);
      if ('success' in result) {
        console.log('✅ 分類刪除成功:', id);
        setCategories(prev => prev.filter(c => c.id !== id));
        if (aId === id) {
          console.log('🔄 已選分類被刪除，重設 aId');
          setAId('');
        }
      } else {
        console.error('❌ 分類刪除失敗:', result.error);
        alert(result.error || '刪除失敗');
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('📤 表單提交');

    const trimmedName = name.trim();
    if (!trimmedName) {
      console.warn('⚠️ 模型名稱為空');
      alert('請輸入模型名稱');
      return;
    }
    if (!aId) {
      console.warn('⚠️ 未選擇分類');
      alert('請選擇所屬分類');
      return;
    }

    const validFields = fields.filter(f => f.label && f.key);
    if (validFields.length === 0) {
      console.warn('⚠️ 至少需一個欄位');
      alert('請至少新增一個欄位');
      return;
    }

    console.log('✅ 表單驗證通過', {
      name: trimmedName,
      aId,
      fieldCount: validFields.length,
    });

    const formData = new FormData();
    formData.append('name', trimmedName);
    formData.append('aId', aId);
    formData.append('fields', JSON.stringify(validFields));

    console.log('🚀 呼叫 createDynamicModel...');
    startTransition(async () => {
      try {
        const result = await createDynamicModel(formData);
        console.log('📥 Server Action 回傳:', result);

        if ('success' in result) {
          console.log('🎉 模型建立成功！準備跳轉...');
          router.push('/spec');
          router.refresh();
        } else {
          console.error('❌ 模型建立失敗:', result.error);
          const errorMsg = Object.values(result.error || {})
            .flat()
            .join(', ');
          alert('建立失敗：' + errorMsg);
        }
      } catch (error: any) {
        console.error('💥 呼叫 Server Action 時發生例外:', error);
        alert('系統錯誤：' + error.message);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* 基本資訊 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="name">模型名稱</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="例如：產品規格表"
            required
            className="mt-2"
          />
        </div>

        <div>
          <Label htmlFor="category">所屬分類</Label>
          <Select value={aId} onValueChange={setAId} required>
            <SelectTrigger id="category" className="mt-2">
              <SelectValue placeholder="選擇分類" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 分類管理列表 */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-lg font-medium">分類管理</Label>
        </div>

        <div className="border rounded-lg p-4 bg-muted/5">
          <div className="space-y-2">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="flex items-center justify-between p-2 rounded hover:bg-muted/50 transition-colors"
              >
                <span className="font-medium">{cat.title}</span>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  onClick={() => handleDeleteCategory(cat.id, cat.title)}
                  className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>

          {isAddingCat ? (
            <div className="flex gap-2 mt-3">
              <Input
                placeholder="新分類名稱"
                value={newCatTitle}
                onChange={(e) => setNewCatTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreateCategory()}
                autoFocus
                className="flex-1"
              />
              <Button type="button" size="sm" onClick={handleCreateCategory} disabled={isPending}>
                確認
              </Button>
              <Button type="button" size="sm" variant="outline" onClick={() => setIsAddingCat(false)}>
                取消
              </Button>
            </div>
          ) : (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setIsAddingCat(true)}
              className="w-full mt-3"
            >
              <Plus className="w-4 h-4 mr-1" />
              新增分類
            </Button>
          )}
        </div>
      </div>

      {/* 欄位設定 */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <Label className="text-lg font-medium">欄位設定</Label>
          <Button type="button" onClick={addField} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            新增欄位
          </Button>
        </div>

        <div className="space-y-4">
          {fields.map((field, index) => (
            <div
              key={index}
              className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center p-4 border rounded-lg bg-muted/20"
            >
              <div className="md:col-span-1">
                <GripVertical className="w-5 h-5 text-muted-foreground" />
              </div>
              <Input placeholder="標籤" value={field.label} onChange={(e) => updateField(index, { label: e.target.value })} className="md:col-span-2" />
              <Input placeholder="鍵名 (key)" value={field.key} onChange={(e) => updateField(index, { key: e.target.value })} className="md:col-span-2" />
              <Switch checked={field.required} onCheckedChange={(c) => updateField(index, { required: c })} />
              <span className="text-sm">必填</span>
              <Button type="button" variant="ghost" size="icon" onClick={() => removeField(index)} className="md:col-span-1">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* 提交按鈕 */}
      <div className="flex justify-end gap-3 pt-6">
        <Button type="button" variant="outline" asChild>
          <Link href="/spec">取消</Link>
        </Button>
        <Button type="submit" disabled={isPending || !name.trim() || !aId}>
          {isPending ? '建立中...' : '建立模型'}
        </Button>
      </div>
    </form>
  );
}