// =============================================================================
// 마음로그 V4.0 - Neo4j 데이터베이스 연결 및 설정
// Project ID: iness-467105
// Connection URI: bolt://localhost:7687
// =============================================================================

// 데이터베이스 연결 확인
CALL dbms.components() YIELD name, versions, edition
RETURN name, versions, edition;

// 현재 데이터베이스 확인
CALL db.info() YIELD name, currentStatus
RETURN name, currentStatus;

// 마음로그 V4.0 전용 데이터베이스 생성 (Neo4j Enterprise만 지원)
// CREATE DATABASE mindlog_v4 IF NOT EXISTS;

// 기본 system 데이터베이스에서 작업하는 경우를 위한 설정
// USE system;

// 프로젝트 메타데이터 노드 생성
CREATE OR REPLACE (:ProjectMeta {
  id: "iness-467105",
  name: "마음로그 V4.0",
  version: "4.0.0-poc",
  phase: "Phase 0: PoC",
  created: datetime(),
  github_repo: "https://github.com/ARGO-022877/LOG1.git",
  ai_architect: "Code Architect AI (Claude 4 Opus Max)"
});

// 연결 테스트 쿼리
MATCH (pm:ProjectMeta {id: "iness-467105"})
RETURN pm.name as project_name, 
       pm.version as version, 
       pm.phase as current_phase,
       pm.created as created_date;

// 스키마 적용 상태 확인
CALL db.constraints() YIELD name, type, entityType, labelsOrTypes, properties
RETURN name, type, entityType, labelsOrTypes, properties
ORDER BY name;

// 인덱스 상태 확인
CALL db.indexes() YIELD name, type, entityType, labelsOrTypes, properties, state
RETURN name, type, entityType, labelsOrTypes, properties, state
ORDER BY name;