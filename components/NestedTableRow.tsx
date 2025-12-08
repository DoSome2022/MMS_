// // components/NestedTableRow.tsx
// 'use client';

// import { TableCell, TableRow } from '@/components/ui/table';
// import { Button } from '@/components/ui/button';
// import { Trash2, Plus, Edit3, Save, X } from 'lucide-react';
// import { useState } from 'react';
// import { DynamicFieldInput } from './DynamicFieldInput';
// import { useMutation } from '@tanstack/react-query';
// import { useRouter } from 'next/navigation';

// interface Props {
//   data: any;
//   fields: any[];
//   modelId: string;
//   level: number;
// }

// export function NestedTableRow({ data, fields, modelId, level }: Props) {
//   const [isEditing, setIsEditing] = useState(false);
//   const [editData, setEditData] = useState(data.data);
//   const router = useRouter();

//   const updateMutation = useMutation({
//     mutationFn: () => fetch(`/api/models/${modelId}/data`, {
//       method: 'PATCH',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ id: data.id, data: editData }),
//     }),
//     onSuccess: () => router.refresh(),
//   });

//   const deleteMutation = useMutation({
//     mutationFn: () => fetch(`/api/models/${modelId}/data`, {
//       method: 'DELETE',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ id: data.id }),
//     }),
//     onSuccess: () => router.refresh(),
//   });

//   const createChild = useMutation({
//     mutationFn: () => fetch(`/api/models/${modelId}/data`, {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ parentId: data.id, data: {} }),
//     }),
//     onSuccess: () => router.refresh(),
//   });

//   return (
//     <>
//       <TableRow>
//         {fields.map((field) => (
//           <TableCell key={field.key} style={{ paddingLeft: `${level * 2 + 1}rem` }}>
//             {isEditing ? (
//               <DynamicFieldInput
//                 field={field}
//                 value={editData[field.key]}
//                 onChange={(v) => setEditData({ ...editData, [field.key]: v })}
//               />
//             ) : field.type === 'image' && editData[field.key] ? (
//               <img src={editData[field.key]} alt="" className="w-12 h-12 object-cover rounded" />
//             ) : (
//               <span>{editData[field.key] || '—'}</span>
//             )}
//           </TableCell>
//         ))}
//         <TableCell className="text-right space-x-1">
//           {isEditing ? (
//             <>
//               <Button size="icon" onClick={() => updateMutation.mutate()}>
//                 <Save className="w-4 h-4" />
//               </Button>
//               <Button size="icon" variant="outline" onClick={() => setIsEditing(false)}>
//                 <X className="w-4 h-4" />
//               </Button>
//             </>
//           ) : (
//             <>
//               <Button size="icon" variant="ghost" onClick={() => setIsEditing(true)}>
//                 <Edit3 className="w-4 h-4" />
//               </Button>
//               <Button size="icon" variant="ghost" onClick={() => createChild.mutate()}>
//                 <Plus className="w-4 h-4" />
//               </Button>
//               <Button
//                 size="icon"
//                 variant="ghost"
//                 className="text-red-600"
//                 onClick={() => {
//                   if (confirm('確定刪除？')) deleteMutation.mutate();
//                 }}
//               >
//                 <Trash2 className="w-4 h-4" />
//               </Button>
//             </>
//           )}
//         </TableCell>
//       </TableRow>

//       {/* 子層遞迴 */}
//       {data.children?.map((child: any) => (
//         <NestedTableRow
//           key={child.id}
//           data={child}
//           fields={fields}
//           modelId={modelId}
//           level={level + 1}
//         />
//       ))}
//     </>
//   );
// }