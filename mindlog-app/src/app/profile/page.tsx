
import { User, Leaf } from 'lucide-react';

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-surface-secondary text-text-primary p-8 pt-24">
      <header className="flex items-center gap-4 mb-8">
        <User className="h-10 w-10 text-primary" />
        <div>
          <h1 className="text-h1 font-bold">프로필</h1>
          <p className="text-body-lg text-text-secondary">나의 정보와 성취, 그리고 마음 정원을 가꾸는 공간입니다.</p>
        </div>
      </header>
      
      <div className="bg-white rounded-lg shadow-base p-8 text-center">
        <Leaf className="h-16 w-16 text-accent mx-auto mb-4" />
        <h2 className="text-h2 font-bold mb-4">벚꽃 정원</h2>
        <p className="text-body text-text-secondary">이곳에 3D 또는 2.5D로 구현된 당신만의 마음 정원이 펼쳐질 예정입니다.</p>
      </div>
    </div>
  );
}
