'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { 
  User,
  signInAnonymously,
  onAuthStateChanged,
  signOut as firebaseSignOut
} from 'firebase/auth';
import { auth, db } from '@/lib/firebase-client';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInAsGuest: () => Promise<void>;
  signOut: () => Promise<void>;
  updateUserProfile: (data: Partial<UserProfile>) => Promise<void>;
  userProfile: UserProfile | null;
}

interface UserProfile {
  uid: string;
  displayName: string;
  email?: string;
  photoURL?: string;
  createdAt: Date;
  lastLoginAt: Date;
  emotionCount: number;
  level: number;
  xp: number;
  preferences: {
    notifications: boolean;
    theme: 'light' | 'dark' | 'auto';
    privacy: 'public' | 'private';
  };
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signInAsGuest: async () => {},
  signOut: async () => {},
  updateUserProfile: async () => {},
  userProfile: null
});

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Firebase Auth 상태 변화 감지
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      
      if (user) {
        // 사용자 프로필 로드 또는 생성
        await loadOrCreateUserProfile(user);
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // 사용자 프로필 로드 또는 생성
  const loadOrCreateUserProfile = async (user: User) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (userDoc.exists()) {
        // 기존 프로필 로드
        const data = userDoc.data();
        setUserProfile({
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          lastLoginAt: data.lastLoginAt?.toDate() || new Date()
        } as UserProfile);
        
        // 마지막 로그인 시간 업데이트
        await setDoc(doc(db, 'users', user.uid), {
          lastLoginAt: serverTimestamp()
        }, { merge: true });
        
      } else {
        // 새 프로필 생성
        const newProfile: UserProfile = {
          uid: user.uid,
          displayName: user.displayName || `User_${user.uid.slice(0, 8)}`,
          email: user.email || undefined,
          photoURL: user.photoURL || undefined,
          createdAt: new Date(),
          lastLoginAt: new Date(),
          emotionCount: 0,
          level: 1,
          xp: 0,
          preferences: {
            notifications: true,
            theme: 'auto',
            privacy: 'private'
          }
        };
        
        await setDoc(doc(db, 'users', user.uid), {
          ...newProfile,
          createdAt: serverTimestamp(),
          lastLoginAt: serverTimestamp()
        });
        
        setUserProfile(newProfile);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  // 게스트로 로그인
  const signInAsGuest = async () => {
    try {
      setLoading(true);
      await signInAnonymously(auth);
    } catch (error) {
      console.error('Guest sign in error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // 로그아웃
  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
      setUserProfile(null);
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  };

  // 사용자 프로필 업데이트
  const updateUserProfile = async (data: Partial<UserProfile>) => {
    if (!user) return;

    try {
      await setDoc(doc(db, 'users', user.uid), data, { merge: true });
      
      if (userProfile) {
        setUserProfile({ ...userProfile, ...data });
      }
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    signInAsGuest,
    signOut,
    updateUserProfile,
    userProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// XP 및 레벨 계산 유틸리티
export function calculateLevel(xp: number): number {
  return Math.floor(xp / 100) + 1;
}

export function calculateXPForNextLevel(currentXP: number): number {
  const currentLevel = calculateLevel(currentXP);
  return (currentLevel * 100) - currentXP;
}

// 감정 체크인 시 XP 증가 훅
export function useXPGain() {
  const { user, userProfile, updateUserProfile } = useAuth();

  const gainXP = async (amount: number = 10) => {
    if (!user || !userProfile) return;

    const newXP = userProfile.xp + amount;
    const newLevel = calculateLevel(newXP);
    const newEmotionCount = userProfile.emotionCount + 1;

    await updateUserProfile({
      xp: newXP,
      level: newLevel,
      emotionCount: newEmotionCount
    });

    // 레벨업 체크
    if (newLevel > userProfile.level) {
      console.log(`🎉 Level up! New level: ${newLevel}`);
      // 레벨업 알림이나 보상 로직 추가 가능
    }

    return {
      xpGained: amount,
      newXP,
      newLevel,
      leveledUp: newLevel > userProfile.level
    };
  };

  return { gainXP };
}