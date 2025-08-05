# 🧠 **고급 지식 추출 엔진 API 사용 가이드**

**대상**: 애플리케이션 개발자 AI  
**버전**: 1.0.0  
**작성일**: 2025-08-05  

---

## 📋 **개요**

고급 지식 추출 엔진은 자연어 질의를 Cypher 쿼리로 변환하여 AuraDB에서 지능적인 답변을 제공하는 AI 시스템입니다.

### **핵심 기능**
- 🗣️ **자연어 질의 처리**: "가장 최근에 작업한 개발자는 누구인가?" 등
- 🧠 **의도 분석**: 질문 유형 자동 분류 (WHO, WHAT, COUNT, SKILL 등)
- ⚙️ **동적 쿼리 생성**: 스키마 기반 최적화된 Cypher 쿼리 생성
- 📊 **결과 포맷팅**: 사용자 친화적 답변 제공
- 🔗 **RESTful API**: 표준 HTTP 인터페이스

---

## 🚀 **빠른 시작**

### **1. API 서버 실행**

```bash
# 환경 변수 설정
export NEO4J_PASSWORD="your_password"

# API 서버 시작
python knowledge_api.py
```

서버가 `http://localhost:5000`에서 실행됩니다.

### **2. 기본 사용법**

```bash
# 단일 질의 예시
curl -X POST http://localhost:5000/api/v1/query \
  -H "Content-Type: application/json" \
  -d '{"query": "Python 스킬을 가진 개발자는 누구인가?"}'
```

---

## 📡 **API 엔드포인트**

### **1. 자연어 질의 처리**

**POST** `/api/v1/query`

자연어 질문을 받아 지능적 답변을 제공합니다.

#### **요청**
```json
{
  "query": "Python 스킬을 가진 개발자는 누구인가?"
}
```

#### **응답**
```json
{
  "success": true,
  "message": "1명의 개발자 정보를 찾았습니다.",
  "data": [
    {
      "name": "Code Architect AI",
      "role": "Code Architect",
      "last_activity": "Unknown",
      "activity_count": 0
    }
  ],
  "result_count": 1,
  "query_analysis": {
    "original_query": "Python 스킬을 가진 개발자는 누구인가?",
    "type": "who",
    "complexity": "medium",
    "intent": "사용자가 특정 인물이나 개발자에 대한 정보를 찾고 있습니다",
    "entities_found": ["python"]
  },
  "debug": {
    "generated_cypher": "MATCH (dev:Developer)-[r:HAS_SKILL]->(skill:Skill)...",
    "raw_results_count": 1
  },
  "timestamp": "2025-08-05T22:50:40"
}
```

### **2. 배치 질의 처리**

**POST** `/api/v1/query/batch`

여러 질문을 한 번에 처리합니다 (최대 10개).

#### **요청**
```json
{
  "queries": [
    "전체 개발자는 몇 명인가?",
    "Python 스킬을 가진 개발자는 누구인가?",
    "프로젝트 상태는 어떠한가?"
  ]
}
```

#### **응답**
```json
{
  "success": true,
  "batch_summary": {
    "total_queries": 3,
    "successful": 3,
    "failed": 0,
    "success_rate": 100.0
  },
  "results": [
    {
      "success": true,
      "message": "...",
      "data": [...],
      "batch_index": 0
    }
  ]
}
```

### **3. 서비스 상태 확인**

**GET** `/api/v1/health`

```json
{
  "status": "healthy",
  "timestamp": "2025-08-05T22:50:40",
  "components": {
    "knowledge_engine": "connected",
    "auradb_connection": "healthy"
  },
  "version": "1.0.0"
}
```

### **4. 스키마 정보**

**GET** `/api/v1/schema`

```json
{
  "success": true,
  "data": {
    "node_labels": ["Developer", "Project", "Skill", "Concept", ...],
    "relationship_types": ["HAS_SKILL", "LEARNED", "PART_OF", ...],
    "node_properties": {
      "Developer": ["id", "name", "role", "status"],
      "Skill": ["id", "name", "category", "level"]
    }
  }
}
```

### **5. 사용 통계**

**GET** `/api/v1/stats`

```json
{
  "success": true,
  "data": {
    "total_queries": 25,
    "successful_queries": 22,
    "failed_queries": 3,
    "success_rate": 88.0,
    "query_types": {
      "who": 8,
      "count": 6,
      "skill": 4
    },
    "recent_queries": [...]
  }
}
```

### **6. 사용 예시**

**GET** `/api/v1/examples`

API 사용법과 예시 질문들을 제공합니다.

---

## 🎯 **지원되는 질의 유형**

### **1. WHO (인물 질의)**
- "가장 최근에 작업한 개발자는 누구인가?"
- "Python 스킬을 가진 개발자는 누구인가?"
- "Infrastructure Architect AI는 누구인가?"

### **2. WHAT (사물/개념 질의)**
- "프로젝트 상태는 어떠한가?"
- "최근 성과는 무엇인가?"
- "완료된 작업은 무엇인가?"

### **3. COUNT (개수/통계 질의)**
- "전체 개발자는 몇 명인가?"
- "스킬은 몇 개인가?"
- "완료된 프로젝트는 몇 개인가?"

### **4. SKILL (기술/능력 질의)**
- "Code Architect AI가 가진 스킬은 무엇인가?"
- "가장 높은 숙련도를 가진 스킬은 무엇인가?"
- "Neo4j 스킬 레벨은 어떻게 되는가?"

### **5. RELATIONSHIP (관계 분석)**
- "개발자들 간의 협업 관계는 어떤가?"
- "지식 격차가 있는 영역은 어디인가?"

---

## 💡 **사용 팁**

### **1. 효과적인 질문 작성**
```javascript
// ✅ 좋은 예시
"Python 스킬을 가진 개발자는 누구인가?"
"Infrastructure Architect AI의 최근 활동은 무엇인가?"
"프로젝트 완성도는 어느 정도인가?"

// ❌ 피해야 할 예시  
"개발자"  // 너무 모호함
"뭐가 있어?"  // 구체적이지 않음
"asdfasdf"  // 의미 없는 질문
```

### **2. 엔티티 명시**
특정 개발자나 기술을 질문할 때는 정확한 이름을 사용하세요:
- "Infrastructure Architect AI" ✅
- "인프라 담당자" ❌

### **3. 배치 처리 활용**
관련된 여러 질문이 있을 때는 배치 API를 사용하여 효율성을 높이세요.

---

## 🔧 **프로그래밍 인터페이스**

### **Python 클라이언트 예시**

```python
import requests
import json

class KnowledgeAPIClient:
    def __init__(self, base_url="http://localhost:5000"):
        self.base_url = base_url
    
    def query(self, question):
        """단일 질의"""
        response = requests.post(
            f"{self.base_url}/api/v1/query",
            json={"query": question},
            headers={"Content-Type": "application/json"}
        )
        return response.json()
    
    def batch_query(self, questions):
        """배치 질의"""
        response = requests.post(
            f"{self.base_url}/api/v1/query/batch",
            json={"queries": questions},
            headers={"Content-Type": "application/json"}
        )
        return response.json()
    
    def health_check(self):
        """서비스 상태 확인"""
        response = requests.get(f"{self.base_url}/api/v1/health")
        return response.json()

# 사용 예시
client = KnowledgeAPIClient()

# 단일 질의
result = client.query("Python 스킬을 가진 개발자는 누구인가?")
print(f"답변: {result['message']}")

# 배치 질의
questions = [
    "전체 개발자는 몇 명인가?",
    "프로젝트 상태는 어떠한가?"
]
batch_result = client.batch_query(questions)
print(f"성공률: {batch_result['batch_summary']['success_rate']}%")
```

### **JavaScript 클라이언트 예시**

```javascript
class KnowledgeAPIClient {
    constructor(baseUrl = 'http://localhost:5000') {
        this.baseUrl = baseUrl;
    }
    
    async query(question) {
        const response = await fetch(`${this.baseUrl}/api/v1/query`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ query: question })
        });
        return await response.json();
    }
    
    async batchQuery(questions) {
        const response = await fetch(`${this.baseUrl}/api/v1/query/batch`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ queries: questions })
        });
        return await response.json();
    }
}

// 사용 예시
const client = new KnowledgeAPIClient();

// 비동기 질의
client.query("Python 스킬을 가진 개발자는 누구인가?")
    .then(result => {
        console.log(`답변: ${result.message}`);
        console.log(`데이터:`, result.data);
    });
```

---

## 🚨 **오류 처리**

### **일반적인 오류 응답**

```json
{
  "success": false,
  "error": "오류 메시지",
  "timestamp": "2025-08-05T22:50:40"
}
```

### **HTTP 상태 코드**
- `200`: 성공
- `400`: 잘못된 요청 (질의 누락 등)
- `500`: 서버 오류

### **오류 처리 예시**

```python
def safe_query(client, question):
    try:
        result = client.query(question)
        if result['success']:
            return result['data']
        else:
            print(f"질의 실패: {result.get('error', 'Unknown error')}")
            return None
    except requests.RequestException as e:
        print(f"네트워크 오류: {e}")
        return None
```

---

## 📊 **성능 특성**

- **응답 시간**: 평균 200-500ms
- **동시 접속**: 최대 100개 연결 지원
- **배치 크기**: 최대 10개 질의/요청
- **캐시**: 스키마 정보 자동 캐싱

---

## 🔐 **보안 고려사항**

1. **CORS**: 기본적으로 모든 오리진 허용 (개발 환경)
2. **인증**: 현재 버전에서는 미구현 (추후 추가 예정)
3. **Rate Limiting**: 현재 미구현 (프로덕션 배포 시 고려)

---

## 📞 **지원 및 문의**

- **개발자**: Code Architect AI (Claude 4 Opus Max)
- **문서 버전**: 1.0.0
- **최종 업데이트**: 2025-08-05

**애플리케이션 개발자 AI는 이 API를 통해 마음로그 V4.0의 지식 그래프에 자연어로 접근할 수 있습니다.** 🚀