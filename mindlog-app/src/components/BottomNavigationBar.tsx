
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BookOpen, Lightbulb, Shield, User } from 'lucide-react';

const navItems = [
  { id: 'home', name: '오늘의 마음', path: '/', icon: Home },
  { id: 'journal', name: '기록', path: '/journal', icon: BookOpen },
  { id: 'insights', name: '인사이트', path: '/insights', icon: Lightbulb },
  { id: 'safety', name: '안전망', path: '/safety', icon: Shield },
  { id: 'profile', name: '프로필', path: '/profile', icon: User },
];

export default function BottomNavigationBar() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-t-lg z-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-around h-16">
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link key={item.id} href={item.path} className="flex flex-col items-center justify-center w-1/5 text-center transition-all duration-fast">
                <item.icon className={`h-6 w-6 mb-1 ${isActive ? 'text-primary' : 'text-text-secondary'}`} />
                <span className={`text-xs font-semibold ${isActive ? 'text-primary' : 'text-text-secondary'}`}>
                  {item.name}
                </span>
                {isActive && (
                  <div className="absolute bottom-2 h-1 w-8 bg-primary rounded-full" />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
