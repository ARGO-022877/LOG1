'use client';

import { useState } from 'react';
// import type { GridItem } from './GalleryGrid'; // TODO: 갤러리 그리드 기능 구현 시 사용
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Smile, Heart, Zap, Cloud, Target, 
  Wifi, WifiOff, Activity, TrendingUp, Star,
  Sparkles, CheckCircle2, ArrowRight
} from 'lucide-react';
import { useRealtime } from '@/hooks/useRealtime';
import { useXPGain } from '@/contexts/AuthContext';
import GalleryGrid from './GalleryGrid';

interface EmotionOption {
  id: string;
  name: string;
  icon: React.ElementType;
  color: string;
  gradient: string;
  description: string;
  keywords: string[];
}

const emotionOptions: EmotionOption[] = [
  { 
    id: 'joy', 
    name: '기쁨', 
    icon: Smile, 
    color: 'text-yellow-600', 
    gradient: 'from-yellow-400 to-orange-400',
    description: '행복하고 즐거운 순간',
    keywords: ['행복', '즐거움', '기쁨', '만족']
  },
  { 
    id: 'peace', 
    name: '평온', 
    icon: Heart, 
    color: 'text-green-600', 
    gradient: 'from-green-400 to-emerald-400',
    description: '차분하고 안정된 마음',
    keywords: ['평온', '안정', '고요', '편안']
  },
  { 
    id: 'achievement', 
    name: '성취감', 
    icon: Target, 
    color: 'text-purple-600', 
    gradient: 'from-purple-400 to-violet-400',
    description: '목표를 달성한 뿌듯함',
    keywords: ['성취', '뿌듯함', '완성', '성공']
  },
  { 
    id: 'energy', 
    name: '활력', 
    icon: Zap, 
    color: 'text-orange-600', 
    gradient: 'from-orange-400 to-red-400',
    description: '에너지가 넘치는 활기찬 기분',
    keywords: ['활력', '에너지', '활기', '역동성']
  },
  { 
    id: 'contemplation', 
    name: '사색', 
    icon: Cloud, 
    color: 'text-blue-600', 
    gradient: 'from-blue-400 to-indigo-400',
    description: '깊이 생각하고 성찰하는 시간',
    keywords: ['사색', '성찰', '고민', '명상']
  }
];

interface GalleryEmotionCheckinProps {
  userId?: string;
}

export default function GalleryEmotionCheckin({ userId }: GalleryEmotionCheckinProps) {
  const [selectedEmotion, setSelectedEmotion] = useState<string | null>(null);
  const [intensity, setIntensity] = useState(5);
  const [note, setNote] = useState('');
  const [currentStep, setCurrentStep] = useState<'select' | 'intensity' | 'note' | 'complete'>('select');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [xpGained, setXpGained] = useState<number | null>(null);
  
  const { 
    isConnected, 
    emotions, 
    insights, 
    connectionError, 
    addEmotionCheckin 
  } = useRealtime(userId);
  
  const { gainXP } = useXPGain();

  const selectedEmotionData = emotionOptions.find(e => e.id === selectedEmotion);
  // const latestEmotion = emotions[0]; // TODO: 감정 히스토리 기능 구현 시 사용
  const latestInsight = insights[0];

  // 감정 선택 핸들러
  const handleEmotionSelect = (emotionId: string) => {
    setSelectedEmotion(emotionId);
    setCurrentStep('intensity');
  };

  // 단계별 네비게이션
  const handleNext = () => {
    if (currentStep === 'intensity') {
      setCurrentStep('note');
    } else if (currentStep === 'note') {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep === 'note') {
      setCurrentStep('intensity');
    } else if (currentStep === 'intensity') {
      setCurrentStep('select');
      setSelectedEmotion(null);
    }
  };

  // 감정 제출
  const handleSubmit = async () => {
    if (!selectedEmotion) return;

    setIsSubmitting(true);
    setCurrentStep('complete');
    
    try {
      await addEmotionCheckin(selectedEmotion, intensity, {
        note,
        source: 'gallery_ui',
        session_id: `session_${Date.now()}`,
        browser: navigator.userAgent.slice(0, 50)
      });
      
      const baseXP = 10;
      const intensityBonus = Math.floor(intensity / 2);
      const noteBonus = note.trim() ? 5 : 0;
      const totalXP = baseXP + intensityBonus + noteBonus;
      
      const xpResult = await gainXP(totalXP);
      if (xpResult) {
        setXpGained(xpResult.xpGained);
      }
      
      setShowSuccess(true);
      
      // 5초 후 초기화
      setTimeout(() => {
        setCurrentStep('select');
        setSelectedEmotion(null);
        setIntensity(5);
        setNote('');
        setShowSuccess(false);
        setXpGained(null);
      }, 5000);
      
    } catch (error) {
      console.error('Error submitting emotion:', error);
      setCurrentStep('note');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 감정 기록들을 갤러리 아이템으로 변환
  const galleryItems = emotions.map(emotion => ({
    id: emotion.id || `emotion_${Date.now()}`,
    title: emotionOptions.find(e => e.id === emotion.emotion)?.name || emotion.emotion,
    subtitle: `강도 ${emotion.intensity}/10`,
    type: 'emotion' as const,
    timestamp: emotion.timestamp,
    metadata: emotion
  }));

  return (
    <div className="space-y-8">
      {/* 상태 표시 바 */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100">
        <div className="flex items-center gap-3">
          {isConnected ? (
            <>
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Wifi className="w-5 h-5 text-green-500" />
              </motion.div>
              <span className="text-sm font-medium text-green-700">실시간 연결됨</span>
            </>
          ) : (
            <>
              <WifiOff className="w-5 h-5 text-red-500" />
              <span className="text-sm font-medium text-red-700">연결 끊김</span>
            </>
          )}
        </div>
        
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Activity className="w-4 h-4" />
            <span>기록: {emotions.length}개</span>
          </div>
          {latestInsight && (
            <div className="flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              <span>인사이트 업데이트됨</span>
            </div>
          )}
        </div>
      </div>

      {/* 에러 표시 */}
      <AnimatePresence>
        {connectionError && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-4 bg-red-50 border border-red-200 rounded-2xl"
          >
            <p className="text-sm text-red-700">{connectionError}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 메인 감정 체크인 영역 */}
      <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
        {/* 진행 표시 바 */}
        <div className="h-1 bg-gray-100">
          <motion.div
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
            initial={{ width: '25%' }}
            animate={{ 
              width: currentStep === 'select' ? '25%' : 
                     currentStep === 'intensity' ? '50%' : 
                     currentStep === 'note' ? '75%' : '100%'
            }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>

        <div className="p-8">
          <AnimatePresence mode="wait">
            {currentStep === 'select' && (
              <motion.div
                key="select"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    지금 이 순간, 당신의 마음은?
                  </h2>
                  <p className="text-gray-600">
                    오늘의 감정을 선택하여 마음의 정원을 가꿔보세요
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                  {emotionOptions.map((emotion, index) => {
                    const Icon = emotion.icon;
                    
                    return (
                      <motion.button
                        key={emotion.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ 
                          scale: 1.05,
                          transition: { duration: 0.2 }
                        }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleEmotionSelect(emotion.id)}
                        className="group relative p-6 rounded-2xl border-2 border-gray-200 hover:border-transparent transition-all duration-300 bg-white hover:shadow-xl"
                      >
                        {/* 배경 그라디언트 (호버시 표시) */}
                        <div className={`
                          absolute inset-0 rounded-2xl bg-gradient-to-br ${emotion.gradient} 
                          opacity-0 group-hover:opacity-10 transition-opacity duration-300
                        `} />
                        
                        <div className="relative text-center space-y-3">
                          <div className={`
                            w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br ${emotion.gradient}
                            flex items-center justify-center
                            group-hover:scale-110 transition-transform duration-300
                          `}>
                            <Icon className="w-8 h-8 text-white" />
                          </div>
                          
                          <div>
                            <h3 className="font-semibold text-gray-900 group-hover:text-gray-800">
                              {emotion.name}
                            </h3>
                            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                              {emotion.description}
                            </p>
                          </div>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {currentStep === 'intensity' && selectedEmotionData && (
              <motion.div
                key="intensity"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <div className={`
                    w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${selectedEmotionData.gradient}
                    flex items-center justify-center
                  `}>
                    <selectedEmotionData.icon className="w-10 h-10 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {selectedEmotionData.name}의 강도는?
                  </h2>
                  <p className="text-gray-600">
                    1부터 10까지 중에서 선택해주세요
                  </p>
                </div>

                <div className="max-w-md mx-auto space-y-4">
                  <div className="relative">
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={intensity}
                      onChange={(e) => setIntensity(Number(e.target.value))}
                      className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, 
                          rgb(99, 102, 241) 0%, 
                          rgb(99, 102, 241) ${(intensity - 1) * 11.11}%, 
                          rgb(229, 231, 235) ${(intensity - 1) * 11.11}%, 
                          rgb(229, 231, 235) 100%)`
                      }}
                    />
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">약함</span>
                    <div className="text-center">
                      <span className="text-3xl font-bold text-indigo-600">{intensity}</span>
                      <span className="text-gray-400">/10</span>
                    </div>
                    <span className="text-sm text-gray-500">강함</span>
                  </div>
                  
                  <div className="grid grid-cols-10 gap-1 mt-4">
                    {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
                      <button
                        key={num}
                        onClick={() => setIntensity(num)}
                        className={`
                          h-8 rounded-lg text-xs font-medium transition-all
                          ${intensity >= num 
                            ? 'bg-indigo-500 text-white' 
                            : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                          }
                        `}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 justify-center">
                  <button
                    onClick={handleBack}
                    className="px-6 py-3 text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    이전
                  </button>
                  <button
                    onClick={handleNext}
                    className="px-8 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-medium hover:shadow-lg transition-all flex items-center gap-2"
                  >
                    다음 <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {currentStep === 'note' && selectedEmotionData && (
              <motion.div
                key="note"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    마음의 이야기를 들려주세요
                  </h2>
                  <p className="text-gray-600">
                    오늘의 감정에 대한 짧은 메모를 남겨보세요 (선택사항)
                  </p>
                </div>

                <div className="max-w-md mx-auto">
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="예: 오늘 프로젝트를 완성해서 기뻤어요..."
                    className="w-full h-32 p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all resize-none"
                    maxLength={200}
                  />
                  <div className="text-right mt-2">
                    <span className="text-xs text-gray-400">{note.length}/200</span>
                  </div>
                </div>

                <div className="flex gap-3 justify-center">
                  <button
                    onClick={handleBack}
                    className="px-6 py-3 text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    이전
                  </button>
                  <button
                    onClick={handleNext}
                    disabled={isSubmitting}
                    className="px-8 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-medium hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        기록 중...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        기록하기
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}

            {currentStep === 'complete' && showSuccess && (
              <motion.div
                key="complete"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-6"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                  className="w-24 h-24 mx-auto bg-gradient-to-br from-green-400 to-emerald-400 rounded-full flex items-center justify-center"
                >
                  <CheckCircle2 className="w-12 h-12 text-white" />
                </motion.div>
                
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    ✨ 마음이 기록되었습니다!
                  </h2>
                  <p className="text-gray-600">
                    당신의 감정이 마음의 정원에 심어졌어요
                  </p>
                </div>

                {xpGained && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-50 border border-yellow-200 rounded-full"
                  >
                    <Star className="w-5 h-5 text-yellow-500" />
                    <span className="text-sm font-medium text-yellow-700">
                      +{xpGained} XP 획득!
                    </span>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* 최근 인사이트 */}
      {latestInsight && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl"
        >
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-100 rounded-xl">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-blue-900 mb-2">🤖 AI 인사이트</h3>
              <p className="text-blue-700 leading-relaxed">
                {(latestInsight.analysis?.recommendations as string[])?.[0] || '감정 패턴을 분석하고 있습니다...'}
              </p>
              <div className="mt-3 flex items-center gap-2 text-sm text-blue-600">
                <span>신뢰도: {Math.round((latestInsight.confidence || 0) * 100)}%</span>
                <span>•</span>
                <span>{new Date(latestInsight.generated_at).toLocaleTimeString()}</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* 감정 기록 갤러리 */}
      {emotions.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-gray-900">최근 감정 기록</h3>
          <GalleryGrid
            items={galleryItems.map(item => ({
              ...item,
              metadata: item.metadata as unknown as Record<string, unknown>
            }))}
            onItemClick={(item) => console.log('Emotion clicked:', item)}
            enableFilters={false}
            enableSearch={false}
          />
        </div>
      )}
    </div>
  );
}