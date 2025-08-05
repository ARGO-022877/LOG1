"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.realtimeUpdates = exports.onKnowledgeUpdate = exports.onEmotionCheckin = void 0;
const firestore_1 = require("firebase-functions/v2/firestore");
const https_1 = require("firebase-functions/v2/https");
const admin = __importStar(require("firebase-admin"));
const neo4j = __importStar(require("neo4j-driver"));
// 실시간 감정 체크인 트리거
exports.onEmotionCheckin = (0, firestore_1.onDocumentCreated)({
    document: 'users/{userId}/emotions/{emotionId}',
    region: 'us-central1'
}, async (event) => {
    const snapshot = event.data;
    if (!snapshot)
        return;
    const data = snapshot.data();
    const userId = event.params.userId;
    console.log(`New emotion checkin for user ${userId}:`, data);
    try {
        // Neo4j에 감정 데이터 실시간 저장
        const driver = neo4j.driver(process.env.NEO4J_URI, neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PASSWORD));
        const session = driver.session();
        const cypherQuery = `
      MERGE (u:User {id: $userId})
      CREATE (e:Emotion {
        id: $emotionId,
        type: $emotionType,
        intensity: $intensity,
        timestamp: datetime($timestamp),
        context: $context
      })
      CREATE (u)-[:FELT]->(e)
      WITH u, e
      // 감정 패턴 분석을 위한 최근 감정들과 연결
      MATCH (u)-[:FELT]->(prev:Emotion)
      WHERE prev.timestamp > datetime($timestamp) - duration('P7D')
      AND prev.id <> $emotionId
      CREATE (prev)-[:FOLLOWED_BY]->(e)
      RETURN e
    `;
        await session.run(cypherQuery, {
            userId,
            emotionId: snapshot.id,
            emotionType: data.emotion,
            intensity: data.intensity,
            timestamp: data.timestamp.toDate().toISOString(),
            context: data.context || {}
        });
        await session.close();
        await driver.close();
        // 실시간 감정 패턴 분석 트리거
        await triggerEmotionAnalysis(userId);
    }
    catch (error) {
        console.error('Error saving emotion to Neo4j:', error);
    }
});
// 지식 그래프 업데이트 트리거
exports.onKnowledgeUpdate = (0, firestore_1.onDocumentUpdated)({
    document: 'knowledge/{nodeId}',
    region: 'us-central1'
}, async (event) => {
    var _a, _b, _c, _d;
    const before = (_b = (_a = event.data) === null || _a === void 0 ? void 0 : _a.before) === null || _b === void 0 ? void 0 : _b.data();
    const after = (_d = (_c = event.data) === null || _c === void 0 ? void 0 : _c.after) === null || _d === void 0 ? void 0 : _d.data();
    if (!before || !after)
        return;
    console.log('Knowledge graph node updated:', {
        before,
        after,
        changes: getChanges(before, after)
    });
    // 실시간으로 연결된 모든 클라이언트에게 업데이트 브로드캐스트
    await broadcastKnowledgeUpdate(event.params.nodeId, after);
});
// 실시간 WebSocket API (Server-Sent Events 활용)
exports.realtimeUpdates = (0, https_1.onRequest)({
    region: 'us-central1',
    cors: true
}, async (req, res) => {
    if (req.method === 'OPTIONS') {
        res.status(200).send();
        return;
    }
    // Server-Sent Events 설정
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type'
    });
    const userId = req.query.userId;
    if (!userId) {
        res.write(`data: ${JSON.stringify({ error: 'User ID required' })}\n\n`);
        res.end();
        return;
    }
    console.log(`Starting realtime connection for user: ${userId}`);
    // 초기 데이터 전송
    const initialData = await getInitialRealtimeData(userId);
    res.write(`data: ${JSON.stringify({ type: 'initial', data: initialData })}\n\n`);
    // Firestore 실시간 리스너 설정
    const db = admin.firestore();
    // 감정 데이터 실시간 리스너
    const emotionUnsubscribe = db
        .collection(`users/${userId}/emotions`)
        .orderBy('timestamp', 'desc')
        .limit(1)
        .onSnapshot((snapshot) => {
        snapshot.docChanges().forEach((change) => {
            var _a, _b, _c;
            if (change.type === 'added') {
                const data = change.doc.data();
                res.write(`data: ${JSON.stringify({
                    type: 'emotion_update',
                    data: Object.assign(Object.assign({ id: change.doc.id }, data), { timestamp: ((_c = (_b = (_a = data.timestamp) === null || _a === void 0 ? void 0 : _a.toDate) === null || _b === void 0 ? void 0 : _b.call(_a)) === null || _c === void 0 ? void 0 : _c.toISOString()) || new Date().toISOString() })
                })}\n\n`);
            }
        });
    });
    // 지식 그래프 실시간 리스너
    const knowledgeUnsubscribe = db
        .collection('knowledge')
        .onSnapshot((snapshot) => {
        snapshot.docChanges().forEach((change) => {
            if (change.type === 'modified') {
                res.write(`data: ${JSON.stringify({
                    type: 'knowledge_update',
                    data: Object.assign({ id: change.doc.id, action: change.type }, change.doc.data())
                })}\n\n`);
            }
        });
    });
    // 인사이트 업데이트 리스너
    const insightsUnsubscribe = db
        .collection(`users/${userId}/insights`)
        .orderBy('generated_at', 'desc')
        .limit(1)
        .onSnapshot((snapshot) => {
        snapshot.docChanges().forEach((change) => {
            var _a, _b, _c;
            if (change.type === 'added') {
                const data = change.doc.data();
                res.write(`data: ${JSON.stringify({
                    type: 'insight_update',
                    data: Object.assign(Object.assign({ id: change.doc.id }, data), { generated_at: ((_c = (_b = (_a = data.generated_at) === null || _a === void 0 ? void 0 : _a.toDate) === null || _b === void 0 ? void 0 : _b.call(_a)) === null || _c === void 0 ? void 0 : _c.toISOString()) || new Date().toISOString() })
                })}\n\n`);
            }
        });
    });
    // 연결 종료 처리
    req.on('close', () => {
        console.log(`Realtime connection closed for user: ${userId}`);
        emotionUnsubscribe();
        knowledgeUnsubscribe();
        insightsUnsubscribe();
    });
    // Keep-alive ping
    const keepAlive = setInterval(() => {
        res.write(`data: ${JSON.stringify({ type: 'ping', timestamp: new Date().toISOString() })}\n\n`);
    }, 30000);
    req.on('close', () => {
        clearInterval(keepAlive);
    });
});
// 실시간 감정 패턴 분석
async function triggerEmotionAnalysis(userId) {
    const db = admin.firestore();
    // 최근 7일간의 감정 데이터 분석
    const emotionsSnapshot = await db
        .collection(`users/${userId}/emotions`)
        .orderBy('timestamp', 'desc')
        .limit(50)
        .get();
    const emotions = emotionsSnapshot.docs.map(doc => {
        var _a, _b, _c;
        return (Object.assign(Object.assign({ id: doc.id }, doc.data()), { timestamp: (_c = (_b = (_a = doc.data().timestamp) === null || _a === void 0 ? void 0 : _a.toDate) === null || _b === void 0 ? void 0 : _b.call(_a)) === null || _c === void 0 ? void 0 : _c.toISOString() }));
    });
    // AI 기반 감정 패턴 분석 (간단한 예시)
    const analysis = analyzeEmotionPatterns(emotions);
    // 분석 결과를 Firestore에 저장하여 실시간 업데이트 트리거
    await db.collection(`users/${userId}/insights`).add({
        type: 'emotion_pattern',
        analysis,
        generated_at: admin.firestore.FieldValue.serverTimestamp(),
        confidence: analysis.confidence
    });
}
// 지식 그래프 업데이트 브로드캐스트
async function broadcastKnowledgeUpdate(nodeId, data) {
    const db = admin.firestore();
    // 실시간 업데이트 이벤트 생성
    await db.collection('realtime_events').add({
        type: 'knowledge_update',
        nodeId,
        data,
        timestamp: admin.firestore.FieldValue.serverTimestamp()
    });
}
// 초기 실시간 데이터 로드
async function getInitialRealtimeData(userId) {
    var _a, _b;
    const db = admin.firestore();
    // 최근 감정 상태
    const recentEmotion = await db
        .collection(`users/${userId}/emotions`)
        .orderBy('timestamp', 'desc')
        .limit(1)
        .get();
    // 최근 인사이트
    const recentInsight = await db
        .collection(`users/${userId}/insights`)
        .orderBy('generated_at', 'desc')
        .limit(1)
        .get();
    return {
        emotion: ((_a = recentEmotion.docs[0]) === null || _a === void 0 ? void 0 : _a.data()) || null,
        insight: ((_b = recentInsight.docs[0]) === null || _b === void 0 ? void 0 : _b.data()) || null,
        timestamp: new Date().toISOString()
    };
}
// 감정 패턴 분석 함수
function analyzeEmotionPatterns(emotions) {
    if (emotions.length < 3) {
        return {
            pattern: 'insufficient_data',
            confidence: 0.1,
            recommendations: ['더 많은 감정 체크인을 진행해주세요.']
        };
    }
    // 감정 빈도 분석
    const emotionCounts = emotions.reduce((acc, emotion) => {
        acc[emotion.emotion] = (acc[emotion.emotion] || 0) + 1;
        return acc;
    }, {});
    const dominantEmotion = Object.keys(emotionCounts)
        .reduce((a, b) => emotionCounts[a] > emotionCounts[b] ? a : b);
    // 시간대별 패턴 분석
    const timePatterns = emotions.map(e => {
        const hour = new Date(e.timestamp).getHours();
        return { emotion: e.emotion, hour };
    });
    return {
        pattern: `dominant_${dominantEmotion}`,
        dominantEmotion,
        emotionDistribution: emotionCounts,
        timePatterns,
        confidence: 0.8,
        recommendations: generateRecommendations(dominantEmotion, emotionCounts)
    };
}
// 맞춤형 추천 생성
function generateRecommendations(dominant, distribution) {
    const recommendations = [];
    if (dominant === '스트레스' || dominant === '불안') {
        recommendations.push('심호흡 연습을 해보세요.');
        recommendations.push('5분간 명상 시간을 가져보세요.');
    }
    else if (dominant === '기쁨' || dominant === '성취감') {
        recommendations.push('현재의 긍정적인 에너지를 다른 활동에도 활용해보세요.');
        recommendations.push('이 기분을 기록하여 나중에 돌아볼 수 있도록 하세요.');
    }
    return recommendations;
}
// 변경사항 감지 헬퍼
function getChanges(before, after) {
    const changes = {};
    for (const key in after) {
        if (before[key] !== after[key]) {
            changes[key] = {
                from: before[key],
                to: after[key]
            };
        }
    }
    return changes;
}
//# sourceMappingURL=realtime.js.map