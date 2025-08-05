'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { BookOpen, Lightbulb, User, Sparkles, Heart } from 'lucide-react';

const navItems = [
  { 
    id: 'home', 
    name: '마음 정원', 
    path: '/', 
    icon: Sparkles,
    gradient: 'from-indigo-500 to-purple-500',
    color: 'text-indigo-600'
  },
  { 
    id: 'journal', 
    name: '기록', 
    path: '/journal', 
    icon: BookOpen,
    gradient: 'from-emerald-500 to-teal-500',
    color: 'text-emerald-600'
  },
  { 
    id: 'insights', 
    name: '인사이트', 
    path: '/insights', 
    icon: Lightbulb,
    gradient: 'from-yellow-500 to-orange-500',
    color: 'text-yellow-600'
  },
  { 
    id: 'safety', 
    name: '안전망', 
    path: '/safety', 
    icon: Heart,
    gradient: 'from-pink-500 to-rose-500',
    color: 'text-pink-600'
  },
  { 
    id: 'profile', 
    name: '프로필', 
    path: '/profile', 
    icon: User,
    gradient: 'from-gray-500 to-slate-500',
    color: 'text-gray-600'
  },
];

export default function BottomNavigationBar() {
  const pathname = usePathname();

  return (
    <motion.nav 
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="fixed bottom-0 left-0 right-0 z-50"
    >
      {/* 배경 블러 효과 */}
      <div className="absolute inset-0 bg-white/80 backdrop-blur-xl border-t border-gray-200/50" />
      
      {/* 상단 그라디언트 라인 */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50" />
      
      <div className="relative max-w-7xl mx-auto px-6">
        <div className="flex justify-around items-center h-20">
          {navItems.map((item, index) => {
            const isActive = pathname === item.path;
            const Icon = item.icon;
            
            return (
              <Link key={item.id} href={item.path}>
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ 
                    delay: index * 0.1,
                    type: "spring",
                    stiffness: 100
                  }}
                  whileHover={{ 
                    scale: 1.1,
                    y: -2
                  }}
                  whileTap={{ scale: 0.95 }}
                  className="relative flex flex-col items-center justify-center p-2 min-w-0"
                >
                  {/* 활성 상태 배경 */}
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className={`
                        absolute inset-0 rounded-2xl bg-gradient-to-br ${item.gradient} opacity-10
                      `}
                      transition={{ type: "spring", duration: 0.6 }}
                    />
                  )}
                  
                  {/* 아이콘 */}
                  <div className={`
                    relative mb-1 p-2 rounded-xl transition-all duration-300
                    ${isActive 
                      ? `bg-gradient-to-br ${item.gradient} shadow-lg` 
                      : 'bg-gray-100 hover:bg-gray-200'
                    }
                  `}>
                    <Icon className={`
                      w-5 h-5 transition-all duration-300
                      ${isActive ? 'text-white' : item.color}
                    `} />
                  </div>
                  
                  {/* 라벨 */}
                  <span className={`
                    text-xs font-medium transition-all duration-300 text-center leading-tight
                    ${isActive 
                      ? `bg-gradient-to-r ${item.gradient} bg-clip-text text-transparent font-semibold` 
                      : 'text-gray-600'
                    }
                  `}>
                    {item.name}
                  </span>
                  
                  {/* 활성 상태 점 */}
                  {isActive && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className={`
                        absolute -top-1 w-2 h-2 rounded-full 
                        bg-gradient-to-br ${item.gradient} shadow-lg
                      `}
                    />
                  )}
                  
                  {/* 호버 효과 */}
                  <motion.div
                    className="absolute inset-0 rounded-2xl"
                    whileHover={{
                      boxShadow: isActive 
                        ? "0 8px 32px rgba(99, 102, 241, 0.3)" 
                        : "0 4px 16px rgba(0, 0, 0, 0.1)"
                    }}
                    transition={{ duration: 0.2 }}
                  />
                </motion.div>
              </Link>
            );
          })}
        </div>
      </div>
      
      {/* iOS 스타일 홈 인디케이터 */}
      <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-gray-300 rounded-full opacity-60" />
    </motion.nav>
  );
}