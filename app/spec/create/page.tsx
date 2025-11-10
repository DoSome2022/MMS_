// app/spec/create/page.tsx

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { CreateModelForm } from '@/components/CreateModelDialog';
import { db } from '@/lib/db';

export const revalidate = 0;

export default async function CreateModelPage() {
  const categories = await db.a.findMany({
    select: { id: true, title: true },
    orderBy: { title: 'asc' },
  });

  return (
    <div className="container mx-auto py-8 max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">建立新模型</h1>
        <Button asChild variant="outline">
          <Link href="/spec">
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回列表
          </Link>
        </Button>
      </div>

      <div className="bg-card border rounded-lg p-8">
        <CreateModelForm categories={categories} />
      </div>
    </div>
  );
}