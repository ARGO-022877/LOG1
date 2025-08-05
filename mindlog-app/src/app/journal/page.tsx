'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, Calendar, Grid3X3, List, Search,
  TrendingUp, Heart, 
  Smile, Zap, Cloud, Target, Star, Clock
} from 'lucide-react';
import { useRealtime } from '@/hooks/useRealtime';
import { useAuth } from '@/contexts/AuthContext';
import GalleryGrid from '@/components/GalleryGrid';

type ViewMode = 'timeline' | 'calendar' | 'gallery' | 'stats';
type FilterPeriod = 'all' | 'today' | 'week' | 'month' | 'year';

export default function JournalPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('timeline');
  // const [selectedDate, setSelectedDate] = useState(new Date()); // TODO: 캘린더 기능 구현 시 사용
  const [filterPeriod, setFilterPeriod] = useState<FilterPeriod>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEmotion, setSelectedEmotion] = useState<string | null>(null);

  const { user } = useAuth();
  const { emotions, isConnected } = useRealtime(user?.uid);

  // 감정 아이콘 매핑
  const emotionIcons: Record<string, { icon: React.ElementType; color: string; gradient: string }> = {
    joy: { icon: Smile, color: 'text-yellow-600', gradient: 'from-yellow-400 to-orange-400' },
    peace: { icon: Heart, color: 'text-green-600', gradient: 'from-green-400 to-emerald-400' },
    achievement: { icon: Target, color: 'text-purple-600', gradient: 'from-purple-400 to-violet-400' },
    energy: { icon: Zap, color: 'text-orange-600', gradient: 'from-orange-400 to-red-400' },
    contemplation: { icon: Cloud, color: 'text-blue-600', gradient: 'from-blue-400 to-indigo-400' }
  };

  // 필터링된 감정 데이터
  const filteredEmotions = useMemo(() => {
    let filtered = emotions;

    // 기간 필터
    const now = new Date();
    if (filterPeriod !== 'all') {
      filtered = filtered.filter(emotion => {
        const emotionDate = new Date(emotion.timestamp);
        switch (filterPeriod) {
          case 'today':
            return emotionDate.toDateString() === now.toDateString();
          case 'week':
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            return emotionDate >= weekAgo;
          case 'month':
            const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
            return emotionDate >= monthAgo;
          case 'year':
            const yearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
            return emotionDate >= yearAgo;
          default:
            return true;
        }
      });
    }

    // 검색 필터
    if (searchQuery) {
      filtered = filtered.filter(emotion => 
        emotion.emotion.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (emotion.context?.note && typeof emotion.context.note === 'string' && emotion.context.note.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // 감정 타입 필터
    if (selectedEmotion) {
      filtered = filtered.filter(emotion => emotion.emotion === selectedEmotion);
    }

    return filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [emotions, filterPeriod, searchQuery, selectedEmotion]);

  // 갤러리 아이템 변환
  const galleryItems = filteredEmotions.map(emotion => ({
    id: emotion.id || `emotion_${Date.now()}`,
    title: emotionIcons[emotion.emotion]?.icon ? 
      `${emotion.emotion} 감정` : 
      emotion.emotion,
    subtitle: `강도 ${emotion.intensity}/10 • ${new Date(emotion.timestamp).toLocaleDateString()}`,
    type: 'emotion' as const,
    timestamp: emotion.timestamp,
    metadata: emotion as unknown as Record<string, unknown>
  }));

  // 통계 계산
  const stats = useMemo(() => {
    if (filteredEmotions.length === 0) return null;

    const emotionCounts = filteredEmotions.reduce((acc, emotion) => {
      acc[emotion.emotion] = (acc[emotion.emotion] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const mostFrequent = Object.entries(emotionCounts)
      .sort(([,a], [,b]) => b - a)[0];

    const avgIntensity = filteredEmotions.reduce((sum, e) => sum + e.intensity, 0) / filteredEmotions.length;

    return {
      total: filteredEmotions.length,
      mostFrequent: mostFrequent ? { emotion: mostFrequent[0], count: mostFrequent[1] } : null,
      avgIntensity: Math.round(avgIntensity * 10) / 10,
      emotionCounts
    };
  }, [filteredEmotions]);

  const viewModeButtons = [
    { id: 'timeline' as ViewMode, icon: List, label: '타임라인' },
    { id: 'calendar' as ViewMode, icon: Calendar, label: '달력' },
    { id: 'gallery' as ViewMode, icon: Grid3X3, label: '갤러리' },
    { id: 'stats' as ViewMode, icon: TrendingUp, label: '통계' }
  ];

  const periodButtons = [
    { id: 'all' as FilterPeriod, label: '전체' },
    { id: 'today' as FilterPeriod, label: '오늘' },
    { id: 'week' as FilterPeriod, label: '이번 주' },
    { id: 'month' as FilterPeriod, label: '이번 달' },
    { id: 'year' as FilterPeriod, label: '올해' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-6 pt-24 pb-20">
        {/* 헤더 */}
        <motion.header 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center">
                <BookOpen className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  마음의 기록
                </h1>
                <p className="text-lg text-gray-600">
                  시간의 흐름 속에서 당신의 감정 여정을 탐색하세요
                </p>
              </div>
            </div>

            {/* 연결 상태 */}
            <div className={`
              px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2
              ${isConnected ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}
            `}>
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
              {isConnected ? '실시간 동기화' : '오프라인'}
            </div>
          </div>
        </motion.header>

        {/* 컨트롤 바 */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 space-y-4"
        >
          {/* 상단 컨트롤 */}
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            {/* 검색 */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="감정이나 메모 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
              />
            </div>

            {/* 뷰 모드 선택 */}
            <div className="flex bg-gray-100 rounded-xl p-1">
              {viewModeButtons.map((button) => {
                const Icon = button.icon;
                return (
                  <button
                    key={button.id}
                    onClick={() => setViewMode(button.id)}
                    className={`
                      flex items-center gap-2 px-4 py-2 rounded-lg transition-all text-sm font-medium
                      ${viewMode === button.id 
                        ? 'bg-white shadow-sm text-emerald-600' 
                        : 'text-gray-600 hover:text-gray-900'
                      }
                    `}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{button.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 필터 컨트롤 */}
          <div className="flex flex-wrap gap-3 items-center">
            {/* 기간 필터 */}
            <div className="flex bg-gray-50 rounded-lg p-1 gap-1">
              {periodButtons.map((button) => (
                <button
                  key={button.id}
                  onClick={() => setFilterPeriod(button.id)}
                  className={`
                    px-3 py-1.5 rounded-md text-sm font-medium transition-all
                    ${filterPeriod === button.id 
                      ? 'bg-white shadow-sm text-gray-900' 
                      : 'text-gray-600 hover:text-gray-900'
                    }
                  `}
                >
                  {button.label}
                </button>
              ))}
            </div>

            {/* 감정 타입 필터 */}
            <div className="flex gap-2">
              {Object.entries(emotionIcons).map(([emotion, config]) => {
                const Icon = config.icon;
                return (
                  <button
                    key={emotion}
                    onClick={() => setSelectedEmotion(selectedEmotion === emotion ? null : emotion)}
                    className={`
                      p-2 rounded-lg transition-all
                      ${selectedEmotion === emotion 
                        ? `bg-gradient-to-br ${config.gradient} text-white shadow-lg` 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }
                    `}
                  >
                    <Icon className="w-4 h-4" />
                  </button>
                );
              })}
            </div>

            {/* 결과 요약 */}
            <div className="text-sm text-gray-600">
              총 {filteredEmotions.length}개 기록
            </div>
          </div>
        </motion.div>

        {/* 통계 요약 카드 */}
        {stats && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
          >
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">총 기록</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Star className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">평균 강도</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.avgIntensity}/10</p>
                </div>
              </div>
            </div>

            {stats.mostFrequent && (
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className={`
                    w-10 h-10 rounded-lg flex items-center justify-center
                    bg-gradient-to-br ${emotionIcons[stats.mostFrequent.emotion]?.gradient || 'from-gray-400 to-gray-500'}
                  `}>
                    {emotionIcons[stats.mostFrequent.emotion] && (() => {
                      const IconComponent = emotionIcons[stats.mostFrequent.emotion].icon;
                      return <IconComponent className="w-5 h-5 text-white" />;
                    })()}
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">가장 많은 감정</p>
                    <p className="text-lg font-bold text-gray-900 capitalize">
                      {stats.mostFrequent.emotion} ({stats.mostFrequent.count}회)
                    </p>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* 메인 콘텐츠 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <AnimatePresence mode="wait">
            {viewMode === 'timeline' && (
              <motion.div
                key="timeline"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                {filteredEmotions.length > 0 ? (
                  filteredEmotions.map((emotion, index) => {
                    const emotionConfig = emotionIcons[emotion.emotion];
                    const Icon = emotionConfig?.icon || Star;
                    const noteText = emotion.context?.note;
                    const hasNote = Boolean(noteText && typeof noteText === 'string');
                    
                    return (
                      <motion.div
                        key={emotion.id || index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-300 cursor-pointer group"
                      >
                        <div className="flex items-start gap-4">
                          <div className={`
                            w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0
                            bg-gradient-to-br ${emotionConfig?.gradient || 'from-gray-400 to-gray-500'}
                            group-hover:scale-110 transition-transform duration-300
                          `}>
                            <Icon className="w-6 h-6 text-white" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-2">
                              <h3 className="font-semibold text-gray-900 capitalize">
                                {emotion.emotion} 감정
                              </h3>
                              <div className="flex items-center gap-2 text-sm text-gray-500">
                                <Clock className="w-4 h-4" />
                                {new Date(emotion.timestamp).toLocaleString()}
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-4 mb-3">
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-600">강도:</span>
                                <div className="flex gap-1">
                                  {Array.from({ length: 10 }, (_, i) => (
                                    <div
                                      key={i}
                                      className={`w-2 h-2 rounded-full ${
                                        i < emotion.intensity ? 'bg-emerald-500' : 'bg-gray-200'
                                      }`}
                                    />
                                  ))}
                                </div>
                                <span className="text-sm font-medium text-gray-900">
                                  {emotion.intensity}/10
                                </span>
                              </div>
                            </div>
                            
                            {hasNote && (
                              <p className="text-gray-600 text-sm leading-relaxed">
                                &ldquo;{noteText as string}&rdquo;
                              </p>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                ) : (
                  <div className="text-center py-16">
                    <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      기록이 없습니다
                    </h3>
                    <p className="text-gray-600">
                      첫 번째 감정을 기록해보세요!
                    </p>
                  </div>
                )}
              </motion.div>
            )}

            {viewMode === 'gallery' && (
              <motion.div
                key="gallery"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="bg-white rounded-2xl p-8 border border-gray-200">
                  <h3 className="text-xl font-semibold text-gray-900 mb-6">감정 갤러리</h3>
                  <GalleryGrid
                    items={galleryItems}
                    onItemClick={(item) => console.log('Emotion clicked:', item)}
                    enableFilters={false}
                    enableSearch={false}
                  />
                </div>
              </motion.div>
            )}

            {(viewMode === 'calendar' || viewMode === 'stats') && (
              <motion.div
                key={viewMode}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-white rounded-2xl p-8 border border-gray-200"
              >
                <div className="text-center py-16">
                  <div className="w-24 h-24 mx-auto bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                    {viewMode === 'calendar' ? (
                      <Calendar className="w-12 h-12 text-emerald-600" />
                    ) : (
                      <TrendingUp className="w-12 h-12 text-emerald-600" />
                    )}
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">
                    {viewMode === 'calendar' ? '달력 뷰' : '통계 뷰'} 준비 중
                  </h4>
                  <p className="text-gray-600 max-w-md mx-auto">
                    {viewMode === 'calendar' 
                      ? '달력 형태의 감정 기록 뷰가 곧 추가됩니다.'
                      : '상세한 통계 차트와 분석이 곧 추가됩니다.'
                    }
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}