'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { db } from '@/lib/firebase-client';
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  serverTimestamp,
  query,
  orderBy,
  limit
} from 'firebase/firestore';

export interface RealtimeEvent {
  type: 'emotion_update' | 'knowledge_update' | 'insight_update' | 'ping' | 'initial';
  data: Record<string, unknown>;
  timestamp?: string;
}

export interface EmotionData {
  id?: string;
  emotion: string;
  intensity: number;
  context?: Record<string, unknown>;
  timestamp: Date;
}

export interface InsightData {
  id?: string;
  type: string;
  analysis: Record<string, unknown>;
  generated_at: Date;
  confidence: number;
}

// 타입 가드 함수들
function isEmotionData(obj: unknown): obj is EmotionData {
  return obj !== null && 
    typeof obj === 'object' &&
    'emotion' in obj &&
    'intensity' in obj &&
    'timestamp' in obj &&
    typeof (obj as Record<string, unknown>).emotion === 'string' && 
    typeof (obj as Record<string, unknown>).intensity === 'number' && 
    ((obj as Record<string, unknown>).timestamp instanceof Date || typeof (obj as Record<string, unknown>).timestamp === 'string');
}

function isInsightData(obj: unknown): obj is InsightData {
  return obj !== null && 
    typeof obj === 'object' &&
    'type' in obj &&
    'analysis' in obj &&
    'generated_at' in obj &&
    'confidence' in obj &&
    typeof (obj as Record<string, unknown>).type === 'string' && 
    typeof (obj as Record<string, unknown>).analysis === 'object' && 
    ((obj as Record<string, unknown>).generated_at instanceof Date || typeof (obj as Record<string, unknown>).generated_at === 'string') &&
    typeof (obj as Record<string, unknown>).confidence === 'number';
}

export function useRealtime(userId?: string) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState<RealtimeEvent | null>(null);
  const [emotions, setEmotions] = useState<EmotionData[]>([]);
  const [insights, setInsights] = useState<InsightData[]>([]);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  
  const eventSourceRef = useRef<EventSource | null>(null);
  const emotionUnsubscribeRef = useRef<(() => void) | null>(null);
  const insightUnsubscribeRef = useRef<(() => void) | null>(null);

  // 감정 체크인 함수
  const addEmotionCheckin = useCallback(async (emotion: string, intensity: number, context?: Record<string, unknown>) => {
    if (!userId) return;

    try {
      const emotionData: EmotionData = {
        emotion,
        intensity,
        context: context || {},
        timestamp: new Date()
      };

      await addDoc(collection(db, `users/${userId}/emotions`), {
        ...emotionData,
        timestamp: serverTimestamp()
      });

      console.log('Emotion checkin added successfully');
    } catch (error) {
      console.error('Error adding emotion checkin:', error);
    }
  }, [userId]);

  // Server-Sent Events 연결
  useEffect(() => {
    if (!userId) return;

    const connectSSE = () => {
      try {
        // Cloud Functions URL (배포 환경에서는 실제 URL로 변경)
        const functionsUrl = process.env.NODE_ENV === 'development' 
          ? 'http://localhost:5001' 
          : 'https://us-central1-iness-467105.cloudfunctions.net';
        
        const eventSource = new EventSource(`${functionsUrl}/realtimeUpdates?userId=${userId}`);
        eventSourceRef.current = eventSource;

        eventSource.onopen = () => {
          console.log('Realtime connection opened');
          setIsConnected(true);
          setConnectionError(null);
        };

        eventSource.onmessage = (event) => {
          try {
            const data: RealtimeEvent = JSON.parse(event.data);
            setLastEvent(data);
            
            console.log('Realtime event received:', data);

            // 이벤트 타입별 처리
            switch (data.type) {
              case 'initial':
                if (data.data.emotion && isEmotionData(data.data.emotion)) {
                  setEmotions([data.data.emotion]);
                }
                if (data.data.insight && isInsightData(data.data.insight)) {
                  setInsights([data.data.insight]);
                }
                break;
              
              case 'emotion_update':
                if (isEmotionData(data.data)) {
                  setEmotions(prev => [data.data as unknown as EmotionData, ...prev.slice(0, 9)]);
                }
                break;
              
              case 'insight_update':
                if (isInsightData(data.data)) {
                  setInsights(prev => [data.data as unknown as InsightData, ...prev.slice(0, 4)]);
                }
                break;
              
              case 'knowledge_update':
                // 지식 그래프 업데이트는 별도 상태나 콜백으로 처리
                console.log('Knowledge graph updated:', data.data);
                break;
            }
          } catch (error) {
            console.error('Error parsing realtime event:', error);
          }
        };

        eventSource.onerror = (error) => {
          console.error('EventSource error:', error);
          setIsConnected(false);
          setConnectionError('실시간 연결에 오류가 발생했습니다.');
          
          // 자동 재연결 (5초 후)
          setTimeout(() => {
            if (eventSourceRef.current?.readyState === EventSource.CLOSED) {
              connectSSE();
            }
          }, 5000);
        };

      } catch (error) {
        console.error('Error establishing SSE connection:', error);
        setConnectionError('실시간 연결을 설정할 수 없습니다.');
      }
    };

    connectSSE();

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, [userId]);

  // Firestore 직접 실시간 리스너 (백업용)
  useEffect(() => {
    if (!userId) return;

    // 감정 데이터 실시간 리스너
    const emotionQuery = query(
      collection(db, `users/${userId}/emotions`),
      orderBy('timestamp', 'desc'),
      limit(10)
    );

    const emotionUnsubscribe = onSnapshot(emotionQuery, (snapshot) => {
      const emotionData = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          timestamp: data.timestamp?.toDate() || new Date()
        } as EmotionData;
      });
      
      setEmotions(emotionData);
    });

    emotionUnsubscribeRef.current = emotionUnsubscribe;

    // 인사이트 데이터 실시간 리스너
    const insightQuery = query(
      collection(db, `users/${userId}/insights`),
      orderBy('generated_at', 'desc'),
      limit(5)
    );

    const insightUnsubscribe = onSnapshot(insightQuery, (snapshot) => {
      const insightData = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          generated_at: data.generated_at?.toDate() || new Date()
        } as InsightData;
      });
      
      setInsights(insightData);
    });

    insightUnsubscribeRef.current = insightUnsubscribe;

    return () => {
      emotionUnsubscribe();
      insightUnsubscribe();
    };
  }, [userId]);

  // 연결 정리
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      if (emotionUnsubscribeRef.current) {
        emotionUnsubscribeRef.current();
      }
      if (insightUnsubscribeRef.current) {
        insightUnsubscribeRef.current();
      }
    };
  }, []);

  return {
    isConnected,
    lastEvent,
    emotions,
    insights,
    connectionError,
    addEmotionCheckin
  };
}

// 실시간 지식 그래프 업데이트 hook
export function useRealtimeKnowledgeGraph() {
  const [graphData, setGraphData] = useState<Record<string, unknown> | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    // 지식 그래프 변경사항 실시간 리스너
    const knowledgeQuery = query(
      collection(db, 'knowledge'),
      orderBy('updated_at', 'desc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(knowledgeQuery, (snapshot) => {
      const nodes = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setGraphData({ nodes, relationships: [] });
      setLastUpdate(new Date());
      
      console.log(`Knowledge graph updated: ${nodes.length} nodes`);
    });

    return unsubscribe;
  }, []);

  return {
    graphData,
    lastUpdate
  };
}

// 실시간 성능 모니터링 hook
export function useRealtimePerformance() {
  const [metrics, setMetrics] = useState({
    latency: 0,
    throughput: 0,
    errorRate: 0,
    activeConnections: 0
  });

  useEffect(() => {
    const startTime = Date.now();
    // eslint-disable-next-line prefer-const
    let requestCount = 0;
    // eslint-disable-next-line prefer-const
    let errorCount = 0;

    const updateMetrics = () => {
      const now = Date.now();
      const runtime = (now - startTime) / 1000; // seconds
      
      setMetrics({
        latency: runtime > 0 ? Math.round(1000 / runtime) : 0,
        throughput: runtime > 0 ? Math.round(requestCount / runtime) : 0,
        errorRate: requestCount > 0 ? Math.round((errorCount / requestCount) * 100) : 0,
        activeConnections: 1 // 현재 연결만 카운트 (실제로는 서버에서 제공)
      });
    };

    const interval = setInterval(updateMetrics, 5000);

    return () => clearInterval(interval);
  }, []);

  return metrics;
}