// // components/DynamicFieldInput.tsx
// 'use client';

// import { Input } from '@/components/ui/input';
// import { Textarea } from '@/components/ui/textarea';
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from '@/components/ui/select';
// import { Button } from '@/components/ui/button';
// import { Upload } from 'lucide-react';
// import { useState } from 'react';

// interface Field {
//   id: string;
//   key: string;
//   label: string;
//   type: string;
//   options?: string[];
//   required?: boolean;
// }

// interface Props {
//   field: Field;
//   value?: any;
//   onChange?: (value: any) => void;
//   name?: string;
//   defaultValue?: any;
// }

// export function DynamicFieldInput({
//   field,
//   value: controlledValue,
//   onChange,
//   name,
//   defaultValue,
// }: Props) {
//   const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue ?? '');
//   const [uploading, setUploading] = useState(false);

//   const isControlled = controlledValue !== undefined && onChange !== undefined;
//   const value = isControlled ? controlledValue : uncontrolledValue;

//   const handleChange = (newValue: any) => {
//     if (isControlled) {
//       onChange?.(newValue);
//     } else {
//       setUncontrolledValue(newValue);
//     }
//   };

//   const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (!file) return;

//     setUploading(true);
//     // 模擬上傳（實際專案請換成 Vercel Blob / Cloudinary / S3）
//     setTimeout(() => {
//       const url = URL.createObjectURL(file);
//       handleChange(url);
//       setUploading(false);
//     }, 800);
//   };

//   const commonProps = {
//     name: name ?? field.key,
//     required: field.required,
//     disabled: uploading,
//   };

//   switch (field.type) {
//     case 'text':
//     case 'email':
//     case 'url':
//       return (
//         <Input
//           {...commonProps}
//           type={field.type === 'text' ? 'text' : field.type}
//           placeholder={field.label}
//           value={isControlled ? value || '' : undefined}
//           defaultValue={!isControlled ? defaultValue : undefined}
//           onChange={(e) => handleChange(e.target.value)}
//         />
//       );

//     case 'number':
//       return (
//         <Input
//           {...commonProps}
//           type="number"
//           placeholder={field.label}
//           value={isControlled ? value ?? '' : undefined}
//           defaultValue={!isControlled ? defaultValue : undefined}
//           onChange={(e) => handleChange(e.target.value ? Number(e.target.value) : null)}
//         />
//       );

//     case 'textarea':
//       return (
//         <Textarea
//           {...commonProps}
//           placeholder={field.label}
//           value={isControlled ? value || '' : undefined}
//           defaultValue={!isControlled ? defaultValue : undefined}
//           onChange={(e) => handleChange(e.target.value)}
//           rows={4}
//         />
//       );

//     case 'select':
//       return (
//         <>
//           <Select
//             value={isControlled ? String(value) : undefined}
//             defaultValue={!isControlled ? String(defaultValue) : undefined}
//             onValueChange={handleChange}
//           >
//             <SelectTrigger>
//               <SelectValue placeholder={`請選擇 ${field.label}`} />
//             </SelectTrigger>
//             <SelectContent>
//               {field.options?.map((opt) => (
//                 <SelectItem key={opt} value={opt}>
//                   {opt}
//                 </SelectItem>
//               ))}
//             </SelectContent>
//           </Select>
//           {/* 讓 Server Action 能拿到值 */}
//           <input type="hidden" name={name ?? field.key} value={value ?? ''} />
//         </>
//       );

//     case 'checkbox':
//       return (
//         <div className="flex items-center space-x-2">
//           <input
//             type="checkbox"
//             id={field.key}
//             {...commonProps}
//             checked={isControlled ? !!value : undefined}
//             defaultChecked={!isControlled ? !!defaultValue : undefined}
//             onChange={(e) => handleChange(e.target.checked)}
//             className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
//           />
//           <label htmlFor={field.key} className="text-sm font-medium">
//             {field.label}
//           </label>
//         </div>
//       );

//     case 'image':
//       return (
//         <div className="space-y-3">
//           {value && (
//             <img
//               src={value}
//               alt={field.label}
//               className="w-32 h-32 object-cover rounded-lg border"
//             />
//           )}
//           <label>
//             <input
//               type="file"
//               accept="image/*"
//               onChange={handleImageUpload}
//               className="hidden"
//               disabled={uploading}
//             />
//             <div>
//               <Button 
//                 type="button" 
//                 variant="outline" 
//                 size="sm" 
//                 disabled={uploading}
//                 className="cursor-pointer"
//               >
//                 <Upload className="w-4 h-4 mr-2 inline" />
//                 {uploading ? '上傳中...' : value ? '更換圖片' : '上傳圖片'}
//               </Button>
//             </div>
//           </label>

//           {/* 把目前圖片 URL 送進 FormData */}
//           {value && <input type="hidden" name={name ?? field.key} value={value} />}
//         </div>
//       );

//     default:
//       return (
//         <Input
//           {...commonProps}
//           placeholder={field.label}
//           value={isControlled ? value || '' : undefined}
//           defaultValue={!isControlled ? defaultValue : undefined}
//           onChange={(e) => handleChange(e.target.value)}
//         />
//       );
//   }
// }


// components/DynamicFieldInput.tsx
'use client';

import { Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';
import Image from 'next/image';

export type FieldType =
  | 'text'
  | 'number'
  | 'textarea'
  | 'select'
  | 'multiselect'
  | 'checkbox'
  | 'radio'
  | 'date'
  | 'color'
  | 'image';

interface Field {
  key: string;
  label: string;
  type: FieldType;
  options?: string[];        // select / multiselect / radio 用
  required?: boolean;
}

interface Props {
  field: Field;
  name?: string;             // 預設為 field.key
  defaultValue?: any;
  className?: string;
}

/**
 * 完全支援 <form> 直送 Server Action 的動態欄位元件
 * 所有值都會以 name={field.key} 送出，Server Action 直接 formData.get(field.key) 即可拿到
 */
export function DynamicFieldInput({ field, name, defaultValue, className }: Props) {
  const fieldName = name || field.key;
  const [imagePreview, setImagePreview] = useState<string | null>(
    field.type === 'image' && defaultValue ? defaultValue : null
  );

  // 圖片上傳（這裡示範直接轉 base64，實務建議改成上傳到 Cloudinary / S3 後回傳 URL）
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setImagePreview(result);
      // 把 base64 寫進隱藏 input，Server Action 會收到
      const hiddenInput = document.querySelector(
        `input[name="${fieldName}"]`
      ) as HTMLInputElement;
      if (hiddenInput) hiddenInput.value = result;
    };
    reader.readAsDataURL(file);
  };

  switch (field.type) {
    case 'text':
    case 'number':
    case 'date':
    case 'color':
      return (
        <Input
          type={field.type}
          name={fieldName}
          defaultValue={defaultValue ?? ''}
          required={field.required}
          className={className}
          placeholder={field.label}
        />
      );

    case 'textarea':
      return (
        <Textarea
          name={fieldName}
          defaultValue={defaultValue ?? ''}
          required={field.required}
          className={className}
          placeholder={field.label}
          rows={4}
        />
      );

    case 'select':
      return (
        <Select
          name={fieldName}
          defaultValue={defaultValue ?? ''}
          required={field.required}
        >
          <SelectTrigger className={className}>
            <SelectValue placeholder={`請選擇 ${field.label}`} />
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

    case 'multiselect':
      // 多選用多個 checkbox 實作（最穩定）
      const selectedValues = (defaultValue as string[]) || [];
      return (
        <div className="space-y-2">
          {field.options?.map((opt) => {
            const checked = selectedValues.includes(opt);
            return (
              <div key={opt} className="flex items-center space-x-2">
                <Checkbox
                  id={`${fieldName}-${opt}`}
                  name={fieldName}
                  value={opt}
                  defaultChecked={checked}
                />
                <Label htmlFor={ `${fieldName}-${opt}`} className="text-sm font-normal cursor-pointer">
                  {opt}
                </Label>
              </div>
            );
          })}
        </div>
      );

    case 'checkbox':
      return (
        <div className="flex items-center space-x-2">
          <Checkbox
            id={fieldName}
            name={fieldName}
            defaultChecked={!!defaultValue}
            value="true"
          />
          <Label htmlFor={fieldName} className="text-sm font-medium cursor-pointer">
            {field.label}
          </Label>
        </div>
      );

    case 'radio':
      return (
        <div className="space-y-2">
          {field.options?.map((opt) => (
            <div key={opt} className="flex items-center space-x-2">
              <input
                type="radio"
                id={`${fieldName}-${opt}`}
                name={fieldName}
                value={opt}
                defaultChecked={defaultValue === opt}
                required={field.required}
                className="h-4 w-4 text-primary focus:ring-primary"
              />
              <Label htmlFor={`${fieldName}-${opt}`} className="text-sm font-normal cursor-pointer">
                {opt}
              </Label>
            </div>
          ))}
        </div>
      );

    case 'image':
      return (
        <div className="space-y-3">
          {imagePreview ? (
            <div className="relative inline-block">
              <Image
                src={imagePreview}
                alt="預覽"
                width={200}
                height={200}
                className="rounded-lg object-cover border"
              />
              <Button
                type="button"
                size="icon"
                variant="destructive"
                className="absolute top-1 right-1 h-7 w-7"
                onClick={() => {
                  setImagePreview(null);
                  const input = document.querySelector(
                    `input[name="${fieldName}"]`
                  ) as HTMLInputElement;
                  if (input) input.value = '';
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="border-2 border-dashed rounded-xl p-8 text-center">
              <Upload className="mx-auto h-10 w-10 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">點擊或拖曳上傳圖片</p>
            </div>
          )}

          <Input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
            id={fieldName}
          />
          <Input type="hidden" name={fieldName} value={imagePreview || ''} />

          <Label
            htmlFor={fieldName}
            className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition"
          >
            <Upload className="h-4 w-4" />
            {imagePreview ? '更換圖片' : '上傳圖片'}
          </Label>
        </div>
      );

    default:
      return (
        <Input
          type="text"
          name={fieldName}
          defaultValue={defaultValue ?? ''}
          placeholder={field.label}
          className={className}
        />
      );
  }
}