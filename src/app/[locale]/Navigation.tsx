'use client';

import React from 'react';
import { usePathname, Link } from '../../navigation';
import { Home, History, Heart, User } from 'lucide-react';

export default function Navigation() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'History', href: '/history', icon: History },
    { name: 'Be Loved', href: '/beloved', icon: Heart },
    { name: 'My Page', href: '/mypage', icon: User },
  ];

  return (
    <nav className="flex justify-around items-center px-4 py-3 w-full">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link 
            key={item.name} 
            href={item.href} 
            className="flex flex-col items-center gap-1 w-16"
          >
            <div 
              className={`
                flex items-center justify-center w-12 h-12 rounded-2xl transition-all duration-300
                ${isActive 
                  ? 'bg-[#2CC2E4] text-white shadow-lg shadow-blue-200 scale-110' 
                  : 'text-gray-300 hover:bg-gray-50'
                }
              `}
            >
              <item.icon size={26} strokeWidth={isActive ? 2.5 : 2} />
            </div>
            <span 
              className={`
                text-[10px] font-bold tracking-widest uppercase transition-colors duration-300
                ${isActive ? 'text-[#2CC2E4]' : 'text-gray-300'}
              `}
            >
              {item.name}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}