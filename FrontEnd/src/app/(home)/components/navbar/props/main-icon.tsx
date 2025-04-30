'use client';

import { useRouter } from "next/navigation";

export default function MainIcon() {
  const router = useRouter();

  return (
    <button 
        className="text-2xl font-bold cursor-pointer" 
        onClick={() => router.push('/')}
      >
        LoketKita
      </button>
  )
}
