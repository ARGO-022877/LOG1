
'use client';

import { useState } from 'react';
import { Compass, Leaf } from 'lucide-react';

export default function Home() {
  const [xp] = useState(65);
  const xpMax = 100;
  const [selectedEmotion, setSelectedEmotion] = useState<string | null>(null);

  const emotions = [
    { name: '기쁨', icon: '😊' },
    { name: '평온', icon: '😌' },
    { name: '슬픔', icon: '😢' },
    { name: '불안', icon: '😟' },
    { name: '성취감', icon: '🏆' },
  ];

  const handleEmotionSelect = (emotionName: string) => {
    setSelectedEmotion(emotionName);
    // TODO: 다음 단계 (감정 체크인 플로우)로 넘어가는 로직 추가
  };

  return (
    // 전체 레이아웃은 이전과 동일하게 유지
    <div className="min-h-screen bg-surface-secondary text-text-primary font-sans">
      <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-sm shadow-sm border-b border-gray-200 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <Leaf className="h-6 w-6 text-accent" />
              <h1 className="text-h3 font-bold">마음 정원</h1>
            </div>
            <div className="flex items-center gap-4 w-1/3">
              <span className="text-sm font-semibold">Lv. 5</span>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div
                  className="bg-accent h-4 rounded-full transition-all duration-normal"
                  style={{ width: `${xp}%` }}
                />
              </div>
              <span className="text-sm font-semibold">{xp}/{xpMax} XP</span>
            </div>
          </div>
        </div>
      </header>
      
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-24">
        <section className="relative flex flex-col items-center justify-center h-96 bg-white rounded-lg shadow-lg mb-8 overflow-hidden">
           <div className="absolute inset-0 bg-sky-100 opacity-50"></div>
           <Compass className="h-32 w-32 text-secondary opacity-50" />
           <h2 className="text-h2 mt-4 text-text-secondary">마음의 나침반</h2>
           <p className="text-body text-text-secondary">감정 날씨가 여기에 표시됩니다.</p>
        </section>

        <section className="bg-white rounded-lg shadow-base p-8 transition-all duration-fast hover:shadow-lg">
          <h3 className="text-h3 font-bold mb-2">오늘, 어떤 마음이 찾아왔나요?</h3>
          <p className="text-body text-text-secondary mb-6">
            오늘의 대표적인 감정을 선택하여 하루를 기록하고, 마음의 씨앗을 얻어보세요.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {emotions.map((emotion) => {
              const isSelected = selectedEmotion === emotion.name;
              return (
                <button
                  key={emotion.name}
                  onClick={() => handleEmotionSelect(emotion.name)}
                  className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 
                             transition-all duration-fast 
                             ${isSelected
                                ? 'bg-primary/10 border-primary scale-105 shadow-lg'
                                : 'bg-surface-secondary border-transparent hover:scale-105 hover:border-primary/50'
                             }
                             focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2`}
                >
                  <span className="text-4xl mb-2">{emotion.icon}</span>
                  <span className={`text-body font-semibold ${isSelected ? 'text-primary' : 'text-text-primary'}`}>
                    {emotion.name}
                  </span>
                </button>
              );
            })}
          </div>
          {selectedEmotion && (
            <div className="mt-6 text-center">
              <button className="bg-primary text-white font-bold py-3 px-8 rounded-full shadow-lg hover:scale-105 transition-transform">
                {selectedEmotion} 기록 계속하기
              </button>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
