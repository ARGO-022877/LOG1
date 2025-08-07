
import { Shield } from 'lucide-react';

export default function SafetyPage() {
  return (
    <div className="min-h-screen bg-surface-secondary text-text-primary p-8 pt-24">
      <header className="flex items-center gap-4 mb-8">
        <Shield className="h-10 w-10 text-secondary" />
        <div>
          <h1 className="text-h1 font-bold">안전망</h1>
          <p className="text-body-lg text-text-secondary">마음이 힘들 때 즉각적인 도움을 받을 수 있는 공간입니다.</p>
        </div>
      </header>
      
      <div className="bg-white rounded-lg shadow-base p-8 text-center">
        <h2 className="text-h2 font-bold mb-4">대처 도구</h2>
        <p className="text-body text-text-secondary">이곳에 호흡 운동, 그라운딩 기법 등 위기 대응 도구들이 표시될 예정입니다.</p>
      </div>
    </div>
  );
}
