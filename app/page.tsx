// app/page.tsx
"use client";

import Link from "next/link";

export default function Home() {

  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <Link href="/spec" className="bg-green-600 text-white px-4 py-2 rounded">
        跳頁到_spec
      </Link>

     
    </div>
  );
}