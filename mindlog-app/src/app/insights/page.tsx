
import { Lightbulb } from 'lucide-react';

export default function InsightsPage() {
  return (
    <div className="min-h-screen bg-surface-secondary text-text-primary p-8 pt-24">
      <header className="flex items-center gap-4 mb-8">
        <Lightbulb className="h-10 w-10 text-accent" />
        <div>
          <h1 className="text-h1 font-bold">AI 인사이트</h1>
          <p className="text-body-lg text-text-secondary">AI가 당신의 마음 데이터를 분석하여 패턴과 성장 제안을 발견합니다.</p>
        </div>
      </header>
      
      <div className="bg-white rounded-lg shadow-base p-8 text-center">
        <h2 className="text-h2 font-bold mb-4">패턴 분석</h2>
        <p className="text-body text-text-secondary">이곳에 AI가 분석한 감정 패턴 리포트가 표시될 예정입니다.</p>
      </div>
    </div>
  );
}
