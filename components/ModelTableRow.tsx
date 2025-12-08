
// components/ModelTableRow.tsx
'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { NestedDataList } from './NextedDataList';


interface Props {
  modelId: string;
  modelName: string;
}

export function ModelTableRow({ modelId, modelName }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border rounded-lg overflow-hidden">
      <div
        className="flex items-center justify-between p-4 bg-muted/50 hover:bg-muted cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2 font-medium">
          {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          <span>{modelName}</span>
        </div>
      </div>
      {isOpen && (
        <div className="p-4 bg-card border-t">
          <NestedDataList modelId={modelId} modelName={modelName} />
        </div>
      )}
    </div>
  );
}