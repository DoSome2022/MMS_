// components/ModelAccordion.tsx
'use client';

import { ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { useState } from 'react';
import { NestedDataTable } from './NestedDataTable';


interface Props {
  modelId: string;
  modelName: string;
  fields: Array<{
    id: string;
    key: string;
    label: string;
    type: string;
    options?: any;
    required?: boolean;
  }>;
  rootItems: any[];
}

export function ModelAccordion({ modelId, modelName, fields, rootItems }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="border rounded-lg overflow-hidden">
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          className="w-full justify-between p-6 text-lg font-medium hover:bg-muted/50"
        >
          <div className="flex items-center gap-3">
            {isOpen ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
            {modelName}
            <span className="text-sm font-normal text-muted-foreground ml-2">
              ({rootItems.length} 筆資料)
            </span>
          </div>
        </Button>
      </CollapsibleTrigger>

      <CollapsibleContent className="border-t bg-card">
        <div className="p-6">
          {/* 這裡是 Server Component，完全沒問題 */}
          <NestedDataTable
            items={rootItems}
            fields={fields}
            modelId={modelId}
            parentId={null}
            level={0}
          />
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}