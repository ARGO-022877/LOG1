# 마음로그 V4.0 - 지식 생성 아키텍처 개요

## 프로젝트 개요
**마음로그 V4.0**은 개발자의 학습과 성장을 추적하고 관리하는 혁신적인 지식 생성 시스템입니다.

## Phase 0: PoC 단계
현재 단계에서는 지식 생성 아키텍처의 기반이 되는 Neo4j 그래프 데이터베이스 스키마를 설계했습니다.

## 핵심 구성 요소

### 1. 노드 타입
- **Developer**: 개발자 정보 및 스킬 추적
- **Project**: 프로젝트 메타데이터 및 진행 상황
- **Commit**: Git 커밋 분석 및 코드 변화 추적
- **File**: 소스 코드 파일 구조 및 복잡도
- **Function/Class**: 코드 구성 요소 분석
- **Concept**: 프로그래밍 개념 및 지식 체계
- **Session**: 학습/개발 세션 추적
- **Skill**: 기술 스킬 및 숙련도 관리
- **Pattern**: 코딩 패턴 및 아키텍처 패턴
- **Issue**: 이슈 및 태스크 관리

### 2. 관계 타입
- 학습 관계: `LEARNED`, `HAS_SKILL`, `PRACTICED`
- 코드 관계: `MODIFIES`, `DEPENDS_ON`, `CONTAINS`, `CALLS`
- 프로젝트 관계: `WORKS_ON`, `AUTHORED`, `RESOLVES`
- 지식 관계: `PREREQUISITE_OF`, `RELATED_TO`, `APPLIED_IN`

### 3. 분석 기능
- 개발자 학습 진도 분석
- 프로젝트 복잡도 측정
- 스킬 향상 추적
- 코드 의존성 분석

## 다음 단계 (Stage 3)
설계된 스키마를 바탕으로 Seed Content를 생성하여 시스템의 초기 데이터를 구축할 예정입니다.