"use client";

import { Link } from '@/navigation';
import { ListTodo, BookOpen, Settings } from 'lucide-react';

export default function Navigation() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 flex justify-around items-center h-16 z-50">
      <Link href="/" className="flex flex-col items-center text-gray-600 hover:text-black">
        <ListTodo size={24} />
        <span className="text-xs font-medium mt-1">할 일</span>
      </Link>
      <Link href="/review" className="flex flex-col items-center text-gray-600 hover:text-black">
        <BookOpen size={24} />
        <span className="text-xs font-medium mt-1">회고</span>
      </Link>
      <Link href="/settings" className="flex flex-col items-center text-gray-600 hover:text-black">
        <Settings size={24} />
        <span className="text-xs font-medium mt-1">설정</span>
      </Link>
    </nav>
  );
}