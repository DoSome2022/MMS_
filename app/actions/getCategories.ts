// app/actions/getCategories.ts
'use server';

import { db } from "@/lib/db";



export async function getACategories() {
  return await db.a.findMany({
    select: { id: true, title: true },
    orderBy: { title: 'asc' },
  });
}