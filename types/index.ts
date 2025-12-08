// types/index.ts
import { JsonValue } from '@prisma/client/runtime/library';

// 使用 DynamicData 作為主要類型（和 Prisma 更兼容）
export interface DynamicData {
  id: string;
  data: JsonValue;
  dynamicModelId: string;
  parentId: string | null;
  children?: DynamicData[];
  createdAt: Date;
  updatedAt: Date;
  _deleted?: boolean; // 添加 _deleted 屬性
}

// 為了解決類型問題，創建一個安全的版本
export interface SafeDynamicData {
  id: string;
  data: Record<string, any>;
  dynamicModelId: string;
  parentId: string | null;
  children?: SafeDynamicData[];
  createdAt: Date;
  updatedAt: Date;
  _deleted?: boolean;
}

export interface Field {
  id: string;
  key: string;
  label: string;
  type: string;
  options?: any;
  required?: boolean;
}

// 工具函數：轉換 JsonValue 為 Record<string, any>
export function jsonToRecord(data: JsonValue): Record<string, any> {
  if (data === null || data === undefined) return {};
  if (typeof data === 'object' && !Array.isArray(data)) {
    return data as Record<string, any>;
  }
  return {};
}

// types/index.ts
// 工具函數：轉換 Prisma 返回的數據為 SafeDynamicData
export function prismaDataToSafeData(data: any): SafeDynamicData {
  // 遞歸處理 children
  const convertChildren = (children: any[] | undefined): SafeDynamicData[] => {
    if (!children || children.length === 0) return [];
    
    return children.map(child => ({
      id: child.id,
      data: jsonToRecord(child.data),
      dynamicModelId: child.dynamicModelId,
      parentId: child.parentId,
      children: convertChildren(child.children), // 遞歸處理
      createdAt: new Date(child.createdAt),
      updatedAt: new Date(child.updatedAt),
    }));
  };

  return {
    id: data.id,
    data: jsonToRecord(data.data),
    dynamicModelId: data.dynamicModelId,
    parentId: data.parentId,
    children: convertChildren(data.children), // 使用轉換函數
    createdAt: new Date(data.createdAt),
    updatedAt: new Date(data.updatedAt),
  };
}

// 工具函數：轉換 DynamicData 為 SafeDynamicData
export function dynamicDataToSafe(data: DynamicData): SafeDynamicData {
  return {
    ...data,
    data: jsonToRecord(data.data),
    children: data.children?.map(dynamicDataToSafe) || [],
  };
}

// 工具函數：類型斷言，安全地訪問 data 屬性
export function getDataValue(data: JsonValue, key: string): any {
  const record = jsonToRecord(data);
  return record[key];
}

