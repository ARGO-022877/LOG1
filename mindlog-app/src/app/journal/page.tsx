
import { BookOpen } from 'lucide-react';

export default function JournalPage() {
  return (
    <div className="min-h-screen bg-surface-secondary text-text-primary p-8 pt-24">
      <header className="flex items-center gap-4 mb-8">
        <BookOpen className="h-10 w-10 text-primary" />
        <div>
          <h1 className="text-h1 font-bold">기록</h1>
          <p className="text-body-lg text-text-secondary">"기록의 강"에서 과거의 감정들을 탐색하세요.</p>
        </div>
      </header>
      
      <div className="bg-white rounded-lg shadow-base p-8 text-center">
        <h2 className="text-h2 font-bold mb-4">기록의 강</h2>
        <p className="text-body text-text-secondary">이곳에 인터랙티브한 타임라인이 구현될 예정입니다.</p>
      </div>
    </div>
  );
}
