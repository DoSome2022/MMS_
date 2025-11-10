// components/DynamicFieldInput.tsx
'use client';

import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import { useState } from 'react';

interface Field {
  key: string;
  label: string;
  type: string;
  options?: string[];
  required?: boolean;
}

interface Props {
  field: Field;
  value: any;
  onChange: (value: any) => void;
}

export function DynamicFieldInput({ field, value, onChange }: Props) {
  const [uploading, setUploading] = useState(false);

  // 模擬圖片上傳
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    // 模擬上傳
    setTimeout(() => {
      const url = URL.createObjectURL(file);
      onChange(url);
      setUploading(false);
    }, 1000);
  };

  switch (field.type) {
    case 'text':
      return (
        <Input
          placeholder={field.label}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          required={field.required}
        />
      );

    case 'number':
      return (
        <Input
          type="number"
          placeholder={field.label}
          value={value || ''}
          onChange={(e) => onChange(Number(e.target.value))}
          required={field.required}
        />
      );

    case 'textarea':
      return (
        <Textarea
          placeholder={field.label}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          required={field.required}
        />
      );

    case 'select':
      return (
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger>
            <SelectValue placeholder={`選擇 ${field.label}`} />
          </SelectTrigger>
          <SelectContent>
            {field.options?.map((opt) => (
              <SelectItem key={opt} value={opt}>
                {opt}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );

    case 'image':
      return (
        <div className="space-y-2">
          {value && <img src={value} alt="" className="w-32 h-32 object-cover rounded" />}
          <label>
            <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            <Button variant="outline" size="sm" disabled={uploading} asChild>
              <span>
                <Upload className="w-4 h-4 mr-1" />
                {uploading ? '上傳中...' : '上傳圖片'}
              </span>
            </Button>
          </label>
        </div>
      );

    default:
      return <Input placeholder={field.label} />;
  }
}