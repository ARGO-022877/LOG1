'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Lightbulb, Brain, Network, TrendingUp, 
  Sparkles, BarChart3, Clock,
  Download, Share2
} from 'lucide-react';
import QueryInput from '@/components/QueryInput';
import KnowledgeGraph from '@/components/KnowledgeGraph';
import DataStats from '@/components/DataStats';
import GalleryGrid from '@/components/GalleryGrid';
import { KnowledgeGraph as KnowledgeGraphType, QueryRequest, QueryResponse } from '@/types/knowledge';
import { useRealtime } from '@/hooks/useRealtime';
import { useAuth } from '@/contexts/AuthContext';

type TabType = 'patterns' | 'knowledge' | 'insights' | 'analytics';

export default function InsightsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('patterns');
  const [knowledgeData, setKnowledgeData] = useState<KnowledgeGraphType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { user } = useAuth();
  const { emotions, insights, isConnected } = useRealtime(user?.uid);

  const handleQuery = async (request: QueryRequest) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      const result: QueryResponse = await response.json();

      if (result.success && result.data) {
        setKnowledgeData(result.data);
      } else {
        setError(result.error || '데이터를 가져오는데 실패했습니다.');
      }
    } catch (err) {
      setError('서버와의 연결에 실패했습니다.');
      console.error('Query error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // 감정 데이터를 갤러리 아이템으로 변환
  const emotionGalleryItems = emotions.map(emotion => ({
    id: emotion.id || `emotion_${Date.now()}`,
    title: `${emotion.emotion} 감정`,
    subtitle: `강도: ${emotion.intensity}/10`,
    type: 'emotion' as const,
    timestamp: emotion.timestamp,
    metadata: emotion as unknown as Record<string, unknown>
  }));

  // 인사이트 데이터를 갤러리 아이템으로 변환
  const insightGalleryItems = insights.map(insight => ({
    id: insight.id || `insight_${Date.now()}`,
    title: insight.type === 'emotion_pattern' ? '감정 패턴 분석' : '인사이트',
    subtitle: `신뢰도: ${Math.round((insight.confidence || 0) * 100)}%`,
    type: 'insight' as const,
    timestamp: insight.generated_at,
    metadata: insight as unknown as Record<string, unknown>
  }));

  const tabs = [
    {
      id: 'patterns' as TabType,
      name: '감정 패턴',
      icon: Brain,
      description: 'AI가 분석한 감정 패턴과 트렌드',
      gradient: 'from-pink-500 to-rose-500'
    },
    {
      id: 'knowledge' as TabType,
      name: '지식 그래프',
      icon: Network,
      description: '실시간 지식 네트워크 탐색',
      gradient: 'from-blue-500 to-indigo-500'
    },
    {
      id: 'insights' as TabType,
      name: 'AI 인사이트',
      icon: Lightbulb,
      description: '개인화된 성장 제안과 통찰',
      gradient: 'from-yellow-500 to-orange-500'
    },
    {
      id: 'analytics' as TabType,
      name: '데이터 분석',
      icon: BarChart3,
      description: '상세한 통계와 분석 리포트',
      gradient: 'from-green-500 to-emerald-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-6 pt-24 pb-20">
        {/* 헤더 */}
        <motion.header 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center">
                <Lightbulb className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  AI 인사이트 센터
                </h1>
                <p className="text-lg text-gray-600 max-w-2xl">
                  당신의 마음 데이터를 AI가 분석하여 패턴을 발견하고 성장 방향을 제시합니다
                </p>
              </div>
            </div>
            
            {/* 상태 표시 */}
            <div className="flex items-center gap-3">
              <div className={`
                px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2
                ${isConnected ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}
              `}>
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                {isConnected ? '실시간 연결됨' : '연결 끊김'}
              </div>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Share2 className="w-5 h-5 text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Download className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </motion.header>

        {/* 탭 네비게이션 - 갤러리 스타일 */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {tabs.map((tab, index) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <motion.button
                  key={tab.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    relative p-6 rounded-2xl border-2 transition-all duration-300 text-left
                    ${isActive 
                      ? 'border-transparent shadow-xl bg-white' 
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-lg'
                    }
                  `}
                >
                  {/* 활성 탭 배경 그라디언트 */}
                  {isActive && (
                    <motion.div
                      layoutId="activeTabBg"
                      className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${tab.gradient} opacity-5`}
                      transition={{ type: "spring", duration: 0.6 }}
                    />
                  )}
                  
                  <div className="relative">
                    <div className={`
                      w-12 h-12 rounded-xl mb-4 flex items-center justify-center
                      ${isActive 
                        ? `bg-gradient-to-br ${tab.gradient}` 
                        : 'bg-gray-100'
                      }
                    `}>
                      <Icon className={`w-6 h-6 ${isActive ? 'text-white' : 'text-gray-600'}`} />
                    </div>
                    
                    <h3 className={`font-semibold mb-2 ${isActive ? 'text-gray-900' : 'text-gray-700'}`}>
                      {tab.name}
                    </h3>
                    <p className="text-sm text-gray-500 leading-relaxed">
                      {tab.description}
                    </p>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* 콘텐츠 영역 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <AnimatePresence mode="wait">
            {activeTab === 'patterns' && (
              <motion.div
                key="patterns"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                {/* 감정 패턴 대시보드 */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* 통계 카드들 */}
                  <div className="bg-white rounded-2xl p-6 border border-gray-200">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-pink-100 rounded-xl flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-pink-600" />
                      </div>
                      <h3 className="font-semibold text-gray-900">감정 트렌드</h3>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">총 기록</span>
                        <span className="font-semibold">{emotions.length}개</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">평균 강도</span>
                        <span className="font-semibold">
                          {emotions.length > 0 
                            ? Math.round(emotions.reduce((sum, e) => sum + e.intensity, 0) / emotions.length)
                            : 0
                          }/10
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">최근 활동</span>
                        <span className="font-semibold">
                          {emotions.length > 0 ? '활발' : '없음'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl p-6 border border-gray-200">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                        <Brain className="w-5 h-5 text-blue-600" />
                      </div>
                      <h3 className="font-semibold text-gray-900">AI 분석</h3>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">인사이트</span>
                        <span className="font-semibold">{insights.length}개</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">평균 신뢰도</span>
                        <span className="font-semibold">
                          {insights.length > 0 
                            ? Math.round(insights.reduce((sum, i) => sum + (i.confidence || 0), 0) / insights.length * 100)
                            : 0
                          }%
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">패턴 인식</span>
                        <span className="font-semibold">
                          {insights.some(i => i.type === 'emotion_pattern') ? '활성' : '대기중'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl p-6 border border-gray-200">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                        <Clock className="w-5 h-5 text-green-600" />
                      </div>
                      <h3 className="font-semibold text-gray-900">시간 분석</h3>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">오늘 기록</span>
                        <span className="font-semibold">
                          {emotions.filter(e => 
                            new Date(e.timestamp).toDateString() === new Date().toDateString()
                          ).length}개
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">이번 주</span>
                        <span className="font-semibold">
                          {emotions.filter(e => {
                            const emotionDate = new Date(e.timestamp);
                            const weekAgo = new Date();
                            weekAgo.setDate(weekAgo.getDate() - 7);
                            return emotionDate >= weekAgo;
                          }).length}개
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">연속 기록</span>
                        <span className="font-semibold">3일</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 감정 기록 갤러리 */}
                {emotions.length > 0 && (
                  <div className="bg-white rounded-2xl p-8 border border-gray-200">
                    <h3 className="text-xl font-semibold text-gray-900 mb-6">감정 기록 갤러리</h3>
                    <GalleryGrid
                      items={emotionGalleryItems}
                      onItemClick={(item) => console.log('Emotion clicked:', item)}
                      enableFilters={true}
                      enableSearch={true}
                    />
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'knowledge' && (
              <motion.div
                key="knowledge"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="bg-white rounded-2xl p-8 border border-gray-200">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <Network className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">지식 그래프 탐색</h3>
                      <p className="text-gray-600">자연어로 질문하여 지식 네트워크를 탐색하세요</p>
                    </div>
                  </div>
                  
                  <QueryInput onSubmit={handleQuery} isLoading={isLoading} />
                  
                  {error && (
                    <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
                      <p className="text-red-700">{error}</p>
                    </div>
                  )}
                  
                  {knowledgeData && (
                    <div className="mt-8">
                      <KnowledgeGraph data={knowledgeData} />
                    </div>
                  )}
                  
                  <div className="mt-8">
                    <DataStats data={knowledgeData} />
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'insights' && (
              <motion.div
                key="insights"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="bg-white rounded-2xl p-8 border border-gray-200">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                      <Sparkles className="w-6 h-6 text-yellow-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">AI 인사이트 갤러리</h3>
                      <p className="text-gray-600">AI가 생성한 개인화된 통찰과 성장 제안</p>
                    </div>
                  </div>

                  {insights.length > 0 ? (
                    <GalleryGrid
                      items={insightGalleryItems}
                      onItemClick={(item) => console.log('Insight clicked:', item)}
                      enableFilters={true}
                      enableSearch={true}
                    />
                  ) : (
                    <div className="text-center py-16">
                      <div className="w-24 h-24 mx-auto bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                        <Lightbulb className="w-12 h-12 text-yellow-600" />
                      </div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">
                        아직 인사이트가 없습니다
                      </h4>
                      <p className="text-gray-600 max-w-md mx-auto">
                        감정을 몇 번 기록하시면 AI가 패턴을 분석하여 개인화된 인사이트를 제공합니다.
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'analytics' && (
              <motion.div
                key="analytics"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="bg-white rounded-2xl p-8 border border-gray-200">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                      <BarChart3 className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">상세 데이터 분석</h3>
                      <p className="text-gray-600">통계와 차트로 보는 감정 여정</p>
                    </div>
                  </div>

                  <div className="text-center py-16">
                    <div className="w-24 h-24 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
                      <BarChart3 className="w-12 h-12 text-green-600" />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">
                      고급 분석 기능 준비 중
                    </h4>
                    <p className="text-gray-600 max-w-md mx-auto">
                      더 상세한 차트와 분석 기능이 곧 추가됩니다.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}