// components/TableSkeleton.tsx
export function TableSkeleton({ rowCount = 3, fields }: { rowCount?: number; fields: any[] }) {
  return (
    <>
      {Array.from({ length: rowCount }).map((_, i) => (
        <tr key={i} className="border-b">
          <td className="px-4 py-3">
            <div className="h-6 w-6 rounded bg-muted animate-pulse" />
          </td>
          {fields.map((_, j) => (
            <td key={j} className="px-4 py-3">
              <div className="h-5 w-full max-w-32 rounded bg-muted animate-pulse" />
            </td>
          ))}
          <td className="px-4 py-3 text-right">
            <div className="flex justify-end gap-1">
              <div className="h-7 w-7 rounded bg-muted animate-pulse" />
              <div className="h-7 w-7 rounded bg-muted animate-pulse" />
            </div>
          </td>
        </tr>
      ))}
    </>
  );
}