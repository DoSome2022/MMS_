// lib/tree.ts
export function buildTree(items: any[]) {
  const map = new Map<string, any>();
  const roots: any[] = [];

  // 步驟1：所有節點放進 map，並預設 children = []
  for (const item of items) {
    map.set(item.id, { ...item, children: [] });
  }

  // 步驟2：根據 parentId 掛回去
  for (const item of items) {
    const node = map.get(item.id)!;
    if (item.parentId === null) {
      roots.push(node);
    } else {
      const parent = map.get(item.parentId);
      if (parent) {
        parent.children.push(node);
      }
    }
  }

  return roots;
}