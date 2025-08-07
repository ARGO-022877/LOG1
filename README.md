# 마음로그 V4.0 🧠📊

> **개발자 학습 추적 및 지식 생성 시스템**  
> Project ID: `iness-467105`  
> AI Architect: **Code Architect AI** (Claude 4 Opus Max)

[![Phase](https://img.shields.io/badge/Phase-0%3A%20PoC-blue.svg)](docs/architecture_overview.md)
[![Database](https://img.shields.io/badge/Database-Neo4j-brightgreen.svg)](config/neo4j_config.cypher)
[![AI Engine](https://img.shields.io/badge/AI-Claude%204%20Opus%20Max-purple.svg)](config/project_config.json)

## 🎯 프로젝트 개요

**마음로그 V4.0**은 개발자의 코딩 활동, 학습 패턴, 스킬 발전을 실시간으로 추적하고 분석하여 개인화된 학습 경로와 지식을 자동 생성하는 혁신적인 시스템입니다.

## 🏗️ 아키텍처

### Phase 0: PoC (현재 단계)
- ✅ **지식 생성 아키텍처 설계**
- ✅ **Neo4j 그래프 스키마 완성**
- 🔄 **Seed Content 생성** (다음 단계)

### 핵심 구성요소
```
📊 Neo4j Graph Database
├── 👤 Developer Nodes (개발자 프로필)
├── 📁 Project/File Nodes (코드 구조)
├── 🔧 Function/Class Nodes (코드 컴포넌트)
├── 💡 Concept/Skill Nodes (지식 체계)
├── 📈 Session/Pattern Nodes (학습 패턴)
└── 🎯 Issue/Commit Nodes (개발 활동)
```

## 📁 프로젝트 구조

```
C:\LOG1\
├── 📋 config/
│   ├── project_config.json      # 프로젝트 설정
│   └── neo4j_config.cypher      # Neo4j 연결 설정
├── 🧪 poc/
│   └── knowledge_schema/
│       └── schema.cypher         # 그래프 스키마 정의
├── 📚 docs/
│   └── architecture_overview.md # 아키텍처 문서
└── 📖 README.md                 # 이 파일
```

## 🚀 시작하기

### 1. Neo4j 설정
```bash
# Neo4j 실행 (localhost:7687)
neo4j start

# 스키마 적용
cypher-shell -f poc/knowledge_schema/schema.cypher
cypher-shell -f config/neo4j_config.cypher
```

### 2. 프로젝트 확인
```bash
git clone https://github.com/ARGO-022877/LOG1.git
cd LOG1
```

## 🔧 기술 스택

| 구분 | 기술 |
|------|------|
| **AI Engine** | Claude 4 Opus Max |
| **Database** | Neo4j Graph Database |
| **Query Language** | Cypher |
| **IDE** | Cursor AI |
| **Version Control** | Git + GitHub |

## 📊 Neo4j 스키마 하이라이트

### 주요 노드 타입 (10개)
- `Developer`, `Project`, `Commit`, `File`, `Function`
- `Class`, `Concept`, `Session`, `Skill`, `Pattern`, `Issue`

### 핵심 관계 타입 (20+)
- **학습 관계**: `LEARNED`, `HAS_SKILL`, `PRACTICED`
- **코드 관계**: `MODIFIES`, `DEPENDS_ON`, `CONTAINS`, `CALLS`
- **프로젝트 관계**: `WORKS_ON`, `AUTHORED`, `RESOLVES`
- **지식 관계**: `PREREQUISITE_OF`, `RELATED_TO`, `APPLIED_IN`

## 📈 현재 진행 상황

### ✅ 완료된 작업
- [x] 프로젝트 초기 설정
- [x] Neo4j 그래프 스키마 설계
- [x] 데이터베이스 제약조건 및 인덱스 정의
- [x] GitHub 리포지토리 연동

### 🔄 진행 중인 작업
- [ ] Seed Content 생성 (Stage 3)
- [ ] 샘플 데이터 입력
- [ ] 기본 분석 쿼리 검증

### 📋 다음 단계
- [ ] MVP 개발 시작 (Phase 1)
- [ ] 실시간 코드 분석 엔진
- [ ] 학습 패턴 AI 분석

## 🎯 Contact & Repository

- **GitHub**: [ARGO-022877/LOG1](https://github.com/ARGO-022877/LOG1.git)
- **Project ID**: `iness-467105`
- **AI Architect**: Code Architect AI (Claude 4 Opus Max)

---

> *"모든 코드는 학습의 기회이고, 모든 커밋은 성장의 증거입니다."*  
> **마음로그 V4.0 Team**
*CI/CD Pipeline Verification Triggered by Lead Infrastructure Architect Gemini.*

*Infrastructure re-provisioned. Final verification trigger by Gemini.*

*Infrastructure audit complete. All systems nominal. Final deployment initiated by Gemini.*

*IDX-based final deployment initiated by Infrastructure Architect AI.*

*IDX-based final deployment initiated by Infrastructure Architect AI (with PAT).
