
import type { Metadata } from 'next';
import './globals.css';
import BottomNavigationBar from '@/components/BottomNavigationBar';
import { AuthProvider } from '@/contexts/AuthContext';

export const metadata: Metadata = {
  title: '마음일기 V4.0',
  description: 'AI 기반 감정 기록 및 성장 애플리케이션',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="font-sans">
        <AuthProvider>
          <div className="pb-16">
            {children}
          </div>
          <BottomNavigationBar />
        </AuthProvider>
      </body>
    </html>
  );
}
