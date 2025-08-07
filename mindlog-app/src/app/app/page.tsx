
'use client';

import { useState, useEffect } from 'react';
import { Compass, Activity, User, Sparkles } from 'lucide-react';
import GalleryEmotionCheckin from '@/components/GalleryEmotionCheckin';
// import { useRealtimePerformance } from '@/hooks/useRealtime';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';

export default function Home() {
  const { user, userProfile, loading, signInAsGuest } = useAuth();
  // const performanceMetrics = useRealtimePerformance();
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
      {/* 간소화된 헤더 */}
      <motion.header 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-md border-b border-gray-200/50 z-50"
      >
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            {/* 로고 */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  마음 정원
                </h1>
              </div>
            </div>

            {/* 사용자 레벨 */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg">
              <div className="w-6 h-6 bg-gradient-to-br from-indigo-400 to-purple-400 rounded-md flex items-center justify-center">
                <User className="w-3 h-3 text-white" />
              </div>
              <span className="text-sm font-medium text-gray-900">Lv. {level}</span>
            </div>
          </div>
        </div>
      </motion.header>
      
      <main className="max-w-6xl mx-auto px-6 pt-20 pb-24">
        {/* 오늘의 인사 */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-gray-900">
              안녕하세요! 👋
            </h2>
            <p className="text-gray-600">
              오늘도 마음을 돌보러 오셨군요. 어떤 기분이신가요?
            </p>
          </div>
        </motion.section>

        {/* 빠른 액션 버튼들 */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <div className="grid grid-cols-2 gap-4">
            {/* 감정 체크인 */}
            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => window.location.href = '/journal'}
              className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 p-6 text-white shadow-lg"
            >
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <Compass className="w-8 h-8" />
                  <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
                    2분
                  </span>
                </div>
                <h3 className="font-bold text-lg mb-1">감정 체크인</h3>
                <p className="text-sm opacity-90">지금 기분을 기록해보세요</p>
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.button>

            {/* 빠른 기록 */}
            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => window.location.href = '/journal'}
              className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 p-6 text-white shadow-lg"
            >
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <Activity className="w-8 h-8" />
                  <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
                    1분
                  </span>
                </div>
                <h3 className="font-bold text-lg mb-1">빠른 기록</h3>
                <p className="text-sm opacity-90">간단한 메모를 남겨보세요</p>
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.button>
          </div>
        </motion.section>

        {/* 오늘의 성장 */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg text-gray-900">벚꽃 성장 현황</h3>
              <span className="text-sm text-gray-500">Level {level}</span>
            </div>
            
            <div className="space-y-4">
              {/* 성장 진행바 */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">현재 경험치</span>
                  <span className="font-medium text-gray-900">{xpInCurrentLevel}/100 XP</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <motion.div
                    className="bg-gradient-to-r from-indigo-500 to-purple-500 h-3 rounded-full relative overflow-hidden"
                    initial={{ width: 0 }}
                    animate={{ width: `${(xpInCurrentLevel / 100) * 100}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  >
                    <div className="absolute inset-0 bg-white/20 animate-pulse" />
                  </motion.div>
                </div>
              </div>

              {/* 벚꽃 나무 시각화 */}
              <div className="flex items-center justify-center py-4">
                <motion.div
                  animate={{ 
                    rotate: [0, 2, -2, 0],
                    scale: [1, 1.02, 1]
                  }}
                  transition={{ 
                    duration: 4, 
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="text-6xl"
                >
                  🌸
                </motion.div>
              </div>
              
              <p className="text-center text-sm text-gray-600">
                매일 기록할 때마다 벚꽃이 더 아름답게 피어납니다
              </p>
            </div>
          </div>
        </motion.section>

        {/* AI 추천 활동 */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-bold text-lg text-gray-900 mb-4">오늘의 추천 활동</h3>
            
            <div className="space-y-3">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl cursor-pointer"
                onClick={() => window.location.href = '/insights'}
              >
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">감정 패턴 분석하기</h4>
                  <p className="text-sm text-gray-600">최근 7일간의 감정 변화를 살펴보세요</p>
                </div>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className="flex items-center gap-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl cursor-pointer"
                onClick={() => window.location.href = '/safety'}
              >
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                  <Activity className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">호흡 운동</h4>
                  <p className="text-sm text-gray-600">5분 간단한 명상으로 마음을 진정해보세요</p>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.section>

        {/* 갤러리 스타일 감정 체크인 */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <GalleryEmotionCheckin userId={user?.uid} />
        </motion.section>
      </main>
    </div>
  );
}
