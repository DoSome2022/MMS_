// components/ModelAccordionClient.tsx
'use client';

import { ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { useState, ReactNode } from 'react';

interface Props {
  modelName: string;
  count: number;
  children: ReactNode;
}

export function ModelAccordionClient({ modelName, count, children }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="border rounded-lg overflow-hidden">
      <CollapsibleTrigger asChild>
        <Button variant="ghost" className="w-full justify-between p-6 text-lg font-medium hover:bg-muted/50">
          <div className="flex items-center gap-3">
            {isOpen ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
            {modelName}
            <span className="text-sm font-normal text-muted-foreground ml-2">
              ({count} 筆資料)
            </span>
          </div>
        </Button>
      </CollapsibleTrigger>

      <CollapsibleContent className="border-t bg-card">
        <div className="p-6">
          {children} {/* 這裡才是真正的 NestedDataTable（Server Component） */}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}