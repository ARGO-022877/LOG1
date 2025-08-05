'use client';

import { useState } from 'react';
import { Smile, Heart, Zap, Cloud, Target, Wifi, WifiOff, Activity, TrendingUp, Star } from 'lucide-react';
import { useRealtime } from '@/hooks/useRealtime';
import { useXPGain } from '@/contexts/AuthContext';

interface EmotionOption {
  id: string;
  name: string;
  icon: React.ElementType;
  color: string;
  description: string;
}

const emotionOptions: EmotionOption[] = [
  { 
    id: 'joy', 
    name: '기쁨', 
    icon: Smile, 
    color: 'text-yellow-500', 
    description: '행복하고 즐거운 기분' 
  },
  { 
    id: 'peace', 
    name: '평온', 
    icon: Heart, 
    color: 'text-green-500', 
    description: '차분하고 안정된 마음' 
  },
  { 
    id: 'achievement', 
    name: '성취감', 
    icon: Target, 
    color: 'text-purple-500', 
    description: '목표를 달성한 뿌듯함' 
  },
  { 
    id: 'energy', 
    name: '활력', 
    icon: Zap, 
    color: 'text-orange-500', 
    description: '에너지가 넘치는 기분' 
  },
  { 
    id: 'sadness', 
    name: '슬픔', 
    icon: Cloud, 
    color: 'text-blue-500', 
    description: '우울하거나 침울한 마음' 
  }
];

interface RealtimeEmotionCheckinProps {
  userId?: string;
}

export default function RealtimeEmotionCheckin({ userId = 'demo_user' }: RealtimeEmotionCheckinProps) {
  const [selectedEmotion, setSelectedEmotion] = useState<string | null>(null);
  const [intensity, setIntensity] = useState(5);
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

  const handleEmotionSelect = (emotionId: string) => {
    setSelectedEmotion(emotionId);
  };

  const handleSubmit = async () => {
    if (!selectedEmotion) return;

    setIsSubmitting(true);
    
    try {
      // 감정 체크인 기록
      await addEmotionCheckin(selectedEmotion, intensity, {
        source: 'web_app',
        session_id: `session_${Date.now()}`,
        browser: navigator.userAgent.slice(0, 50)
      });
      
      // XP 증가 (강도에 따라 더 많은 XP)
      const baseXP = 10;
      const intensityBonus = Math.floor(intensity / 2);
      const totalXP = baseXP + intensityBonus;
      
      const xpResult = await gainXP(totalXP);
      if (xpResult) {
        setXpGained(xpResult.xpGained);
      }
      
      setShowSuccess(true);
      setSelectedEmotion(null);
      setIntensity(5);
      
      // 성공 메시지 자동 숨김
      setTimeout(() => {
        setShowSuccess(false);
        setXpGained(null);
      }, 5000);
      
    } catch (error) {
      console.error('Error submitting emotion:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedEmotionData = emotionOptions.find(e => e.id === selectedEmotion);
  // const latestEmotion = emotions[0]; // TODO: 감정 히스토리 기능 구현 시 사용
  const latestInsight = insights[0];

  return (
    <div className="space-y-6">
      {/* 연결 상태 표시 */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-2">
          {isConnected ? (
            <>
              <Wifi className="w-4 h-4 text-green-500" />
              <span className="text-sm text-green-700">실시간 연결됨</span>
            </>
          ) : (
            <>
              <WifiOff className="w-4 h-4 text-red-500" />
              <span className="text-sm text-red-700">연결 끊김</span>
            </>
          )}
        </div>
        
        {emotions.length > 0 && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Activity className="w-4 h-4" />
            <span>최근 체크인: {emotions.length}개</span>
          </div>
        )}
      </div>

      {/* 연결 오류 표시 */}
      {connectionError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">{connectionError}</p>
        </div>
      )}

      {/* 성공 메시지 with XP */}
      {showSuccess && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg animate-pulse">
          <div className="flex items-center gap-2">
            <p className="text-sm text-green-700">✨ 감정이 성공적으로 기록되었습니다!</p>
            {xpGained && (
              <div className="flex items-center gap-1 text-yellow-600">
                <Star className="w-4 h-4" />
                <span className="text-sm font-bold">+{xpGained} XP</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 최근 인사이트 표시 */}
      {latestInsight && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-medium text-blue-700">실시간 AI 인사이트</span>
          </div>
          <p className="text-sm text-blue-600">
            {(latestInsight.analysis?.recommendations as string[])?.[0] || '감정 패턴을 분석 중입니다...'}
          </p>
          <p className="text-xs text-blue-500 mt-1">
            신뢰도: {Math.round((latestInsight.confidence || 0) * 100)}%
          </p>
        </div>
      )}

      {/* 감정 선택 UI */}
      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-4">지금 이 순간, 당신의 마음은?</h2>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {emotionOptions.map((emotion) => {
            const Icon = emotion.icon;
            const isSelected = selectedEmotion === emotion.id;
            
            return (
              <button
                key={emotion.id}
                onClick={() => handleEmotionSelect(emotion.id)}
                className={`
                  p-6 rounded-2xl border-2 transition-all duration-300 hover:scale-105
                  ${isSelected 
                    ? 'border-indigo-500 bg-indigo-50 shadow-lg' 
                    : 'border-gray-200 bg-white hover:border-gray-300'
                  }
                `}
              >
                <div className="text-center space-y-2">
                  <Icon className={`w-8 h-8 mx-auto ${emotion.color}`} />
                  <p className="font-medium text-gray-800">{emotion.name}</p>
                  <p className="text-xs text-gray-500">{emotion.description}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 강도 조절 */}
      {selectedEmotion && (
        <div className="space-y-4 p-6 bg-white border border-gray-200 rounded-xl">
          <div className="flex items-center gap-3">
            {selectedEmotionData && (
              <>
                <selectedEmotionData.icon className={`w-6 h-6 ${selectedEmotionData.color}`} />
                <h3 className="text-lg font-medium">
                  {selectedEmotionData.name}의 강도는 어느 정도인가요?
                </h3>
              </>
            )}
          </div>
          
          <div className="space-y-2">
            <input
              type="range"
              min="1"
              max="10"
              value={intensity}
              onChange={(e) => setIntensity(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-sm text-gray-500">
              <span>약함 (1)</span>
              <span className="font-medium text-gray-700">{intensity}/10</span>
              <span>강함 (10)</span>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full py-3 px-6 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {isSubmitting ? '기록 중...' : '✨ 마음 기록하기'}
          </button>
        </div>
      )}

      {/* 최근 감정 기록 표시 */}
      {emotions.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-medium text-gray-800">최근 감정 기록</h3>
          <div className="space-y-2">
            {emotions.slice(0, 3).map((emotion, index) => {
              const emotionOption = emotionOptions.find(e => e.id === emotion.emotion);
              if (!emotionOption) return null;
              
              const Icon = emotionOption.icon;
              
              return (
                <div 
                  key={emotion.id || index} 
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                >
                  <Icon className={`w-5 h-5 ${emotionOption.color}`} />
                  <div className="flex-1">
                    <span className="font-medium">{emotionOption.name}</span>
                    <span className="text-sm text-gray-500 ml-2">
                      강도 {emotion.intensity}/10
                    </span>
                  </div>
                  <span className="text-xs text-gray-400">
                    {emotion.timestamp ? new Date(emotion.timestamp).toLocaleTimeString() : '방금'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// CSS for custom slider styling
const sliderStyles = `
.slider::-webkit-slider-thumb {
  appearance: none;
  height: 20px;
  width: 20px;
  border-radius: 50%;
  background: #4f46e5;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

.slider::-moz-range-thumb {
  height: 20px;
  width: 20px;
  border-radius: 50%;
  background: #4f46e5;
  cursor: pointer;
  border: none;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}
`;

// 스타일을 head에 추가
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = sliderStyles;
  document.head.appendChild(styleSheet);
}