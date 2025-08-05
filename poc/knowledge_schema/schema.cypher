// =============================================================================
// 마음로그 V4.0 - 지식 생성 아키텍처 스키마 (Neo4j Cypher DDL)
// Phase 0: PoC - Stage 3 Seed Content 용 그래프 데이터베이스 스키마
// =============================================================================

// -----------------------------------------------------------------------------
// 1. 노드 제약 조건 및 인덱스 생성
// -----------------------------------------------------------------------------

// 개발자 노드
CREATE CONSTRAINT developer_id_unique IF NOT EXISTS FOR (d:Developer) REQUIRE d.id IS UNIQUE;
CREATE INDEX developer_name_index IF NOT EXISTS FOR (d:Developer) ON (d.name);

// 프로젝트 노드
CREATE CONSTRAINT project_id_unique IF NOT EXISTS FOR (p:Project) REQUIRE p.id IS UNIQUE;
CREATE INDEX project_name_index IF NOT EXISTS FOR (p:Project) ON (p.name);

// 코밋 노드
CREATE CONSTRAINT commit_hash_unique IF NOT EXISTS FOR (c:Commit) REQUIRE c.hash IS UNIQUE;
CREATE INDEX commit_timestamp_index IF NOT EXISTS FOR (c:Commit) ON (c.timestamp);

// 파일 노드
CREATE CONSTRAINT file_path_unique IF NOT EXISTS FOR (f:File) REQUIRE f.path IS UNIQUE;
CREATE INDEX file_type_index IF NOT EXISTS FOR (f:File) ON (f.extension);

// 함수/메서드 노드
CREATE CONSTRAINT function_signature_unique IF NOT EXISTS FOR (fn:Function) REQUIRE fn.signature IS UNIQUE;
CREATE INDEX function_name_index IF NOT EXISTS FOR (fn:Function) ON (fn.name);

// 클래스 노드
CREATE CONSTRAINT class_full_name_unique IF NOT EXISTS FOR (cls:Class) REQUIRE cls.fullName IS UNIQUE;
CREATE INDEX class_name_index IF NOT EXISTS FOR (cls:Class) ON (cls.name);

// 개념 노드
CREATE CONSTRAINT concept_id_unique IF NOT EXISTS FOR (con:Concept) REQUIRE con.id IS UNIQUE;
CREATE INDEX concept_name_index IF NOT EXISTS FOR (con:Concept) ON (con.name);

// 학습 세션 노드
CREATE CONSTRAINT session_id_unique IF NOT EXISTS FOR (s:Session) REQUIRE s.id IS UNIQUE;
CREATE INDEX session_date_index IF NOT EXISTS FOR (s:Session) ON (s.startTime);

// 스킬 노드
CREATE CONSTRAINT skill_id_unique IF NOT EXISTS FOR (sk:Skill) REQUIRE sk.id IS UNIQUE;
CREATE INDEX skill_category_index IF NOT EXISTS FOR (sk:Skill) ON (sk.category);

// 패턴 노드
CREATE CONSTRAINT pattern_id_unique IF NOT EXISTS FOR (pat:Pattern) REQUIRE pat.id IS UNIQUE;
CREATE INDEX pattern_type_index IF NOT EXISTS FOR (pat:Pattern) ON (pat.type);

// 이슈/태스크 노드
CREATE CONSTRAINT issue_id_unique IF NOT EXISTS FOR (i:Issue) REQUIRE i.id IS UNIQUE;
CREATE INDEX issue_status_index IF NOT EXISTS FOR (i:Issue) ON (i.status);

// -----------------------------------------------------------------------------
// 2. 노드 라벨 및 속성 정의
// -----------------------------------------------------------------------------

// Developer: 개발자 정보
// 속성: id, name, email, level, joinDate, skills[]
// 예시: (:Developer {id: "dev001", name: "김개발", email: "kim@example.com", level: "Senior", joinDate: "2023-01-01"})

// Project: 프로젝트 정보
// 속성: id, name, description, startDate, status, techStack[]
// 예시: (:Project {id: "proj001", name: "마음로그 V4.0", description: "개발자 학습 추적 시스템", startDate: "2024-01-01", status: "Active"})

// Commit: Git 커밋 정보
// 속성: hash, message, timestamp, author, changedFiles, linesAdded, linesDeleted, complexity
// 예시: (:Commit {hash: "abc123", message: "Add user authentication", timestamp: "2024-01-15T10:30:00Z", author: "김개발"})

// File: 소스 코드 파일
// 속성: path, name, extension, size, complexity, lastModified, language
// 예시: (:File {path: "src/auth/login.js", name: "login.js", extension: "js", language: "JavaScript"})

// Function: 함수/메서드
// 속성: signature, name, parameters[], returnType, complexity, lineCount, testCoverage
// 예시: (:Function {signature: "authenticate(username, password)", name: "authenticate", complexity: 5})

// Class: 클래스
// 속성: fullName, name, namespace, methods[], properties[], inheritance[]
// 예시: (:Class {fullName: "auth.UserManager", name: "UserManager", namespace: "auth"})

// Concept: 프로그래밍 개념/지식
// 속성: id, name, category, description, difficulty, prerequisites[]
// 예시: (:Concept {id: "con001", name: "OAuth 2.0", category: "Authentication", difficulty: "Intermediate"})

// Session: 학습/개발 세션
// 속성: id, startTime, endTime, duration, activities[], focusAreas[], productivity
// 예시: (:Session {id: "sess001", startTime: "2024-01-15T09:00:00Z", duration: 120, productivity: 85})

// Skill: 기술 스킬
// 속성: id, name, category, level, lastPracticed, proficiency
// 예시: (:Skill {id: "skill001", name: "React", category: "Frontend", level: "Advanced", proficiency: 90})

// Pattern: 코딩 패턴/아키텍처 패턴
// 속성: id, name, type, description, benefits[], drawbacks[], useCases[]
// 예시: (:Pattern {id: "pat001", name: "Observer Pattern", type: "Behavioral", description: "Define a subscription mechanism"})

// Issue: 이슈/태스크
// 속성: id, title, description, priority, status, assignee, createdDate, resolvedDate
// 예시: (:Issue {id: "ISS001", title: "Implement user login", priority: "High", status: "In Progress"})

// -----------------------------------------------------------------------------
// 3. 관계 타입 정의
// -----------------------------------------------------------------------------

// 개발자 관련 관계
// (:Developer)-[:WORKS_ON]->(:Project) - 개발자가 프로젝트에 참여
// (:Developer)-[:AUTHORED]->(:Commit) - 개발자가 커밋을 작성
// (:Developer)-[:HAS_SKILL]->(:Skill) - 개발자가 스킬을 보유
// (:Developer)-[:PARTICIPATED_IN]->(:Session) - 개발자가 세션에 참여
// (:Developer)-[:LEARNED]->(:Concept) - 개발자가 개념을 학습

// 프로젝트 관련 관계
// (:Project)-[:CONTAINS]->(:File) - 프로젝트가 파일을 포함
// (:Project)-[:HAS_ISSUE]->(:Issue) - 프로젝트가 이슈를 보유
// (:Project)-[:USES_PATTERN]->(:Pattern) - 프로젝트가 패턴을 사용

// 커밋 관련 관계
// (:Commit)-[:MODIFIES]->(:File) - 커밋이 파일을 수정
// (:Commit)-[:RESOLVES]->(:Issue) - 커밋이 이슈를 해결
// (:Commit)-[:IMPLEMENTS]->(:Concept) - 커밋이 개념을 구현
// (:Commit)-[:FOLLOWS]->(:Commit) - 커밋 순서 관계

// 파일 관련 관계
// (:File)-[:CONTAINS]->(:Function) - 파일이 함수를 포함
// (:File)-[:CONTAINS]->(:Class) - 파일이 클래스를 포함
// (:File)-[:DEPENDS_ON]->(:File) - 파일 간 의존성
// (:File)-[:IMPORTS]->(:File) - 파일 간 임포트 관계

// 함수 관련 관계
// (:Function)-[:CALLS]->(:Function) - 함수 간 호출 관계
// (:Function)-[:BELONGS_TO]->(:Class) - 함수가 클래스에 속함
// (:Function)-[:IMPLEMENTS]->(:Pattern) - 함수가 패턴을 구현
// (:Function)-[:TESTS]->(:Function) - 테스트 함수와 대상 함수

// 클래스 관련 관계
// (:Class)-[:INHERITS_FROM]->(:Class) - 클래스 상속 관계
// (:Class)-[:IMPLEMENTS]->(:Pattern) - 클래스가 패턴을 구현
// (:Class)-[:USES]->(:Class) - 클래스 간 사용 관계

// 개념 관련 관계
// (:Concept)-[:PREREQUISITE_OF]->(:Concept) - 개념 간 선수 관계
// (:Concept)-[:RELATED_TO]->(:Concept) - 개념 간 연관 관계
// (:Concept)-[:APPLIED_IN]->(:Pattern) - 개념이 패턴에 적용

// 세션 관련 관계
// (:Session)-[:FOCUSED_ON]->(:Concept) - 세션이 개념에 집중
// (:Session)-[:PRACTICED]->(:Skill) - 세션에서 스킬을 연습
// (:Session)-[:WORKED_ON]->(:Issue) - 세션에서 이슈를 작업

// 스킬 관련 관계
// (:Skill)-[:REQUIRES]->(:Concept) - 스킬이 개념을 요구
// (:Skill)-[:ENHANCED_BY]->(:Pattern) - 스킬이 패턴으로 향상

// 이슈 관련 관계
// (:Issue)-[:ASSIGNED_TO]->(:Developer) - 이슈가 개발자에게 할당
// (:Issue)-[:PART_OF]->(:Project) - 이슈가 프로젝트의 일부
// (:Issue)-[:BLOCKS]->(:Issue) - 이슈 간 블로킹 관계
// (:Issue)-[:RELATED_TO]->(:Issue) - 이슈 간 연관 관계

// -----------------------------------------------------------------------------
// 4. 관계 제약 조건 및 속성 정의
// -----------------------------------------------------------------------------

// WORKS_ON 관계 속성: role, startDate, endDate, contribution
// AUTHORED 관계 속성: timestamp, linesAdded, linesDeleted
// HAS_SKILL 관계 속성: level, acquiredDate, lastUsed
// LEARNED 관계 속성: learnedDate, masteryLevel, timeSpent
// MODIFIES 관계 속성: linesAdded, linesDeleted, changeType
// DEPENDS_ON 관계 속성: dependencyType, strength
// CALLS 관계 속성: frequency, callType
// FOCUSED_ON 관계 속성: duration, intensity, outcome

// -----------------------------------------------------------------------------
// 5. 시드 데이터 생성을 위한 샘플 쿼리
// -----------------------------------------------------------------------------

// 샘플 개발자 생성
// CREATE (:Developer {
//   id: "dev001", 
//   name: "김개발", 
//   email: "kim.dev@example.com", 
//   level: "Senior",
//   joinDate: "2023-01-01",
//   skills: ["JavaScript", "Python", "React", "Neo4j"]
// });

// 샘플 프로젝트 생성
// CREATE (:Project {
//   id: "proj001",
//   name: "마음로그 V4.0",
//   description: "개발자 학습 추적 및 지식 생성 시스템",
//   startDate: "2024-01-01",
//   status: "Active",
//   techStack: ["JavaScript", "Neo4j", "React", "Node.js"]
// });

// 샘플 관계 생성
// MATCH (d:Developer {id: "dev001"}), (p:Project {id: "proj001"})
// CREATE (d)-[:WORKS_ON {role: "Lead Developer", startDate: "2024-01-01", contribution: 85}]->(p);

// -----------------------------------------------------------------------------
// 6. 분석 쿼리 템플릿
// -----------------------------------------------------------------------------

// 개발자의 학습 진도 분석
// MATCH (d:Developer)-[:LEARNED]->(c:Concept)
// WHERE d.id = $developerId
// RETURN c.name, c.category, c.difficulty
// ORDER BY c.difficulty;

// 프로젝트의 복잡도 분석
// MATCH (p:Project)-[:CONTAINS]->(f:File)-[:CONTAINS]->(fn:Function)
// WHERE p.id = $projectId
// RETURN AVG(fn.complexity) as avgComplexity, COUNT(fn) as functionCount;

// 스킬 향상 추적
// MATCH (d:Developer)-[r:HAS_SKILL]->(s:Skill)
// WHERE d.id = $developerId
// RETURN s.name, r.level, r.lastUsed
// ORDER BY r.lastUsed DESC;

// 코드 의존성 분석
// MATCH (f1:File)-[:DEPENDS_ON]->(f2:File)
// WHERE f1.path CONTAINS $pathPattern
// RETURN f1.path, f2.path, COUNT(*) as dependencyCount
// ORDER BY dependencyCount DESC;

// -----------------------------------------------------------------------------
// 스키마 생성 완료
// -----------------------------------------------------------------------------

// 이 스키마는 마음로그 V4.0의 지식 생성 아키텍처의 기반이 되며,
// 개발자의 학습 패턴, 코드 진화, 스킬 발전을 추적할 수 있는
// 포괄적인 그래프 데이터베이스 구조를 제공합니다.