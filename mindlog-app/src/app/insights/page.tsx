
'use client';

import { useState } from 'react';
import { Lightbulb, Brain, Database, Network } from 'lucide-react';
import QueryInput from '@/components/QueryInput';
import KnowledgeGraph from '@/components/KnowledgeGraph';
import DataStats from '@/components/DataStats';
import { KnowledgeGraph as KnowledgeGraphType, QueryRequest, QueryResponse } from '@/types/knowledge';

export default function InsightsPage() {
  const [activeTab, setActiveTab] = useState<'patterns' | 'knowledge'>('patterns');
  const [knowledgeData, setKnowledgeData] = useState<KnowledgeGraphType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <div className="min-h-screen bg-surface-secondary text-text-primary p-8 pt-24">
      <header className="flex items-center gap-4 mb-8">
        <Lightbulb className="h-10 w-10 text-accent" />
        <div>
          <h1 className="text-h1 font-bold">AI 인사이트</h1>
          <p className="text-body-lg text-text-secondary">AI가 당신의 마음 데이터를 분석하여 패턴과 성장 제안을 발견합니다.</p>
        </div>
      </header>

      {/* 탭 네비게이션 */}
      <div className="flex gap-4 mb-8">
        <button
          onClick={() => setActiveTab('patterns')}
          className={`px-6 py-3 rounded-lg font-semibold transition-all ${
            activeTab === 'patterns'
              ? 'bg-primary text-white shadow-lg'
              : 'bg-white text-text-secondary hover:bg-primary/10'
          }`}
        >
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            <span>감정 패턴 분석</span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('knowledge')}
          className={`px-6 py-3 rounded-lg font-semibold transition-all ${
            activeTab === 'knowledge'
              ? 'bg-primary text-white shadow-lg'
              : 'bg-white text-text-secondary hover:bg-primary/10'
          }`}
        >
          <div className="flex items-center gap-2">
            <Network className="h-5 w-5" />
            <span>지식 그래프</span>
          </div>
        </button>
      </div>

      {/* 탭 콘텐츠 */}
      {activeTab === 'patterns' ? (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-base p-8">
            <h2 className="text-h2 font-bold mb-4 flex items-center gap-3">
              <Brain className="h-8 w-8 text-secondary" />
              감정 패턴 분석
            </h2>
            <p className="text-body text-text-secondary mb-6">
              당신의 감정 기록을 AI가 분석하여 숨겨진 패턴과 인사이트를 발견합니다.
            </p>
            
            {/* 감정 패턴 카드들 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-surface-secondary rounded-lg p-6">
                <h3 className="text-h3 font-bold text-primary mb-2">주요 감정 트렌드</h3>
                <p className="text-body text-text-secondary">
                  지난 한 달간 &apos;평온&apos;과 &apos;성취감&apos;이 증가하고 있습니다.
                </p>
              </div>
              <div className="bg-surface-secondary rounded-lg p-6">
                <h3 className="text-h3 font-bold text-secondary mb-2">활동 상관관계</h3>
                <p className="text-body text-text-secondary">
                  운동 후 긍정적 감정이 85% 증가하는 패턴을 발견했습니다.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-base p-8">
            <h2 className="text-h2 font-bold mb-4">AI 성장 제안</h2>
            <div className="space-y-4">
              <div className="border-l-4 border-accent pl-4">
                <h4 className="font-bold text-body-lg">명상 루틴 추천</h4>
                <p className="text-body text-text-secondary">
                  불안감이 높은 오후 3-5시에 5분 호흡 명상을 추천합니다.
                </p>
              </div>
              <div className="border-l-4 border-primary pl-4">
                <h4 className="font-bold text-body-lg">감정 표현 연습</h4>
                <p className="text-body text-text-secondary">
                  긍정적 감정을 더 자세히 기록하면 행복감이 지속됩니다.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Neo4j 지식 그래프 대시보드 */}
          <div className="bg-white rounded-lg shadow-base p-8">
            <h2 className="text-h2 font-bold mb-4 flex items-center gap-3">
              <Database className="h-8 w-8 text-secondary" />
              지식 그래프 탐색
            </h2>
            <p className="text-body text-text-secondary mb-6">
              Neo4j 기반의 지식 그래프에서 감정, 활동, 인사이트 간의 관계를 탐색합니다.
            </p>
            
            {/* Query Input */}
            <QueryInput onSubmit={handleQuery} isLoading={isLoading} />
            
            {/* Error Display */}
            {error && (
              <div className="mt-4 p-4 bg-error/10 border border-error/20 rounded-lg">
                <p className="text-error">{error}</p>
              </div>
            )}
          </div>

          {/* Data Statistics */}
          <DataStats data={knowledgeData} />

          {/* Knowledge Graph Visualization */}
          <KnowledgeGraph data={knowledgeData} />
        </div>
      )}
    </div>
  );
}
