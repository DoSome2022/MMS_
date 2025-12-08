// components/types.ts
export interface DataItem {
  id: string;
  data: Record<string, any>;
  dynamicModelId: string;
  parentId?: string | null;
  children?: DataItem[];
  createdAt: Date;
  updatedAt: Date;
  _deleted?: boolean;
}

export interface Field {
  key: string;
  label: string;
  type: string;
  required?: boolean;
  options?: any;
}