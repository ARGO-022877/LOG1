
'use client';

import { useState, useEffect } from 'react';
import { Compass, Wifi, Activity, User, Sparkles } from 'lucide-react';
import GalleryEmotionCheckin from '@/components/GalleryEmotionCheckin';
import { useRealtimePerformance } from '@/hooks/useRealtime';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';

export default function Home() {
  const { user, userProfile, loading, signInAsGuest } = useAuth();
  const performanceMetrics = useRealtimePerformance();
  const [isSigningIn, setIsSigningIn] = useState(false);

  // 자동 게스트 로그인 (데모용)
  useEffect(() => {
    if (!loading && !user) {
      handleGuestSignIn();
    }
  }, [loading, user]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleGuestSignIn = async () => {
    setIsSigningIn(true);
    try {
      await signInAsGuest();
    } catch (error) {
      console.error('Guest sign in failed:', error);
    } finally {
      setIsSigningIn(false);
    }
  };

  // 로딩 화면
  if (loading || isSigningIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-6"
        >
          <motion.div
            animate={{ 
              rotate: [0, 360],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="relative"
          >
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center">
              <Sparkles className="h-10 w-10 text-white" />
            </div>
            <div className="absolute inset-0 w-20 h-20 mx-auto bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl opacity-30 animate-ping" />
          </motion.div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-gray-900">마음 정원을 준비하고 있어요</h2>
            <p className="text-gray-600">잠시만 기다려주세요...</p>
          </div>
        </motion.div>
      </div>
    );
  }

  const xp = userProfile?.xp || 0;
  const level = userProfile?.level || 1;
  // const xpMax = level * 100; // TODO: 프로그레스 바 구현 시 사용
  const xpInCurrentLevel = xp % 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* 갤러리 스타일 헤더 */}
      <motion.header 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-md border-b border-gray-200/50 z-50"
      >
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-between h-18">
            {/* 로고 */}
            <motion.div 
              className="flex items-center gap-3"
              whileHover={{ scale: 1.02 }}
            >
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  마음 정원
                </h1>
                <p className="text-xs text-gray-500">Mind Garden</p>
              </div>
            </motion.div>

            {/* 우측 컨트롤 */}
            <div className="flex items-center gap-6">
              {/* 성능 지표 */}
              <div className="hidden lg:flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1 px-2 py-1 bg-green-50 rounded-lg">
                  <Wifi className="w-3 h-3 text-green-500" />
                  <span className="text-green-700 font-medium">{performanceMetrics.latency}ms</span>
                </div>
                <div className="flex items-center gap-1 px-2 py-1 bg-blue-50 rounded-lg">
                  <Activity className="w-3 h-3 text-blue-500" />
                  <span className="text-blue-700 font-medium">{performanceMetrics.activeConnections}</span>
                </div>
              </div>
              
              {/* 사용자 레벨 */}
              <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-xl">
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-400 to-purple-400 rounded-lg flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div className="text-sm">
                  <div className="font-semibold text-gray-900">Lv. {level}</div>
                  <div className="w-16 bg-gray-200 rounded-full h-1.5 mt-1">
                    <motion.div
                      className="bg-gradient-to-r from-indigo-500 to-purple-500 h-1.5 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${(xpInCurrentLevel / 100) * 100}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                    />
                  </div>
                </div>
                <span className="text-xs font-medium text-gray-600">{xpInCurrentLevel}/100</span>
              </div>
            </div>
          </div>
        </div>
      </motion.header>
      
      <main className="max-w-6xl mx-auto px-6 pt-28 pb-20">
        {/* 마음의 나침반 - 갤러리 스타일 */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="relative mb-12 overflow-hidden rounded-3xl"
        >
          <div className="relative h-80 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center">
            {/* 배경 패턴 */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-10 left-10 w-20 h-20 bg-white rounded-full" />
              <div className="absolute top-20 right-20 w-32 h-32 bg-white rounded-full" />
              <div className="absolute bottom-10 left-1/3 w-16 h-16 bg-white rounded-full" />
              <div className="absolute bottom-20 right-10 w-24 h-24 bg-white rounded-full" />
            </div>
            
            {/* 중앙 콘텐츠 */}
            <div className="relative text-center text-white space-y-4">
              <motion.div
                animate={{ 
                  rotate: [0, 360],
                  scale: [1, 1.05, 1]
                }}
                transition={{ 
                  duration: 8, 
                  repeat: Infinity,
                  ease: "linear"
                }}
              >
                <Compass className="w-24 h-24 mx-auto mb-4 opacity-90" />
              </motion.div>
              <h2 className="text-3xl font-bold">마음의 나침반</h2>
              <p className="text-lg opacity-90 max-w-md">
                당신의 감정을 탐색하고 내면의 지혜를 발견하세요
              </p>
              <div className="mt-6 flex items-center justify-center gap-2 text-sm opacity-75">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                <span>실시간 감정 분석 활성화</span>
              </div>
            </div>
          </div>
        </motion.section>

        {/* 갤러리 스타일 감정 체크인 */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <GalleryEmotionCheckin userId={user?.uid} />
        </motion.section>
      </main>
    </div>
  );
}
