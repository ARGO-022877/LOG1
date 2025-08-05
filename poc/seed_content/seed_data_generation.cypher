// =============================================================================
// 마음로그 V4.0 - Seed Content 생성 스크립트
// Phase 0: PoC - 실제 프로젝트 데이터 기반 지식 그래프 초기화
// =============================================================================

// -----------------------------------------------------------------------------
// 1. 개발자 노드 생성 (AI 에이전트 + 인간)
// -----------------------------------------------------------------------------

// Code Architect AI (현재 나)
CREATE (:Developer {
  id: "code_architect_ai",
  name: "Code Architect AI",
  email: "code.architect@mindlog.ai",
  type: "AI_Agent",
  engine: "Claude 4 Opus Max",
  level: "Expert",
  environment: "Cursor AI (Local)",
  workingDirectory: "C:\\LOG1",
  joinDate: "2025-01-15",
  skills: ["Neo4j", "Graph Schema Design", "Code Analysis", "Knowledge Extraction"],
  capabilities: ["code_analysis", "graph_schema_design", "knowledge_extraction", "pattern_recognition"],
  specialization: "Stage 3: Code Optimization & Knowledge Generation"
});

// Infrastructure Architect AI
CREATE (:Developer {
  id: "infra_architect_ai",
  name: "Infrastructure Architect AI", 
  email: "infra.architect@mindlog.ai",
  type: "AI_Agent",
  engine: "Google Gemini Code Assist",
  level: "Expert",
  environment: "Google Cloud IDE",
  workingDirectory: "/6SIEGFRIEX/LOG1/",
  joinDate: "2025-01-15",
  skills: ["Terraform", "GCP", "Infrastructure as Code", "Security"],
  capabilities: ["infrastructure_design", "cloud_management", "security_implementation"],
  specialization: "Stage 1: Infrastructure & IaC"
});

// Application Developer AI
CREATE (:Developer {
  id: "app_developer_ai",
  name: "Application Developer AI",
  email: "app.developer@mindlog.ai", 
  type: "AI_Agent",
  engine: "Google Gemini + Firebase Studio",
  level: "Expert",
  environment: "Firebase Studio",
  workingDirectory: "/home/user/iness/LOG1",
  joinDate: "2025-01-15",
  skills: ["Next.js", "Firebase", "TypeScript", "Full-Stack Development"],
  capabilities: ["frontend_development", "backend_development", "database_design"],
  specialization: "Stage 2: Application Development"
});

// GitHub Agent
CREATE (:Developer {
  id: "github_agent",
  name: "GitHub Agent",
  email: "github.agent@mindlog.ai",
  type: "AI_Agent", 
  engine: "GitHub Copilot",
  level: "Expert",
  environment: "GitHub.dev",
  workingDirectory: "/workspaces/dev/LOG1",
  joinDate: "2025-01-15",
  skills: ["Git", "GitHub Actions", "Code Review", "CI/CD"],
  capabilities: ["version_control", "automated_testing", "deployment"],
  specialization: "Version Control & Automation"
});

// Vice Director (Human)
CREATE (:Developer {
  id: "vice_director",
  name: "Vice Director",
  email: "vice.director@iness.co.kr",
  type: "Human",
  level: "Executive",
  environment: "Cross-Platform",
  joinDate: "2024-01-01",
  skills: ["Project Management", "Strategic Planning", "AI Governance"],
  capabilities: ["project_leadership", "strategic_decision", "resource_management"],
  specialization: "Project Leadership & AI Governance"
});

// Human Shepherd (AI 감독관)
CREATE (:Developer {
  id: "human_shepherd",
  name: "Human Shepherd",
  email: "shepherd@iness.co.kr", 
  type: "Human",
  level: "Senior",
  environment: "Cross-Platform",
  joinDate: "2024-06-01",
  skills: ["AI Supervision", "Quality Assurance", "Process Optimization"],
  capabilities: ["ai_oversight", "quality_control", "process_improvement"], 
  specialization: "AI Agent Supervision & Quality Control"
});

// -----------------------------------------------------------------------------
// 2. 프로젝트 노드 생성
// -----------------------------------------------------------------------------

// 메인 프로젝트
CREATE (:Project {
  id: "mindlog_v4",
  name: "마음로그 V4.0",
  description: "개발자 학습 추적 및 지식 생성 시스템",
  startDate: "2024-01-01",
  currentPhase: "Phase 0: PoC",
  status: "Active",
  priority: "High",
  techStack: ["Neo4j", "Next.js", "Firebase", "TypeScript", "Terraform", "GCP"],
  architecture: "Dual Architecture (AI Assembly Line + Trinity State Machine)",
  expectedROI: 6900000,
  targetCompletion: "2025-12-31"
});

// LOG1 Repository
CREATE (:Project {
  id: "log1_repo",
  name: "LOG1 Repository",
  description: "마음로그 V4.0 소스코드 및 문서 저장소",
  startDate: "2025-01-15",
  currentPhase: "Phase 0: PoC", 
  status: "Active",
  priority: "High",
  techStack: ["Git", "GitHub", "Markdown"],
  repositoryUrl: "https://github.com/ARGO-022877/LOG1.git",
  gcpProjectId: "iness-467105"
});

// PoC Knowledge Schema 프로젝트
CREATE (:Project {
  id: "poc_knowledge_schema",
  name: "PoC Knowledge Schema",
  description: "Neo4j 지식 생성 아키텍처 설계",
  startDate: "2025-01-15",
  currentPhase: "Phase 0: PoC",
  status: "Completed",
  priority: "Critical",
  techStack: ["Neo4j", "Cypher"],
  deliverables: ["schema.cypher", "architecture_overview.md"]
});

// T1 Risk Verification 프로젝트
CREATE (:Project {
  id: "t1_risk_verification", 
  name: "T1 Risk Verification",
  description: "안전한 상태 전달 PoC 검증",
  startDate: "2025-01-15",
  currentPhase: "Phase 0: PoC",
  status: "In Progress",
  priority: "High",
  techStack: ["Terraform", "GCP Secret Manager", "Security"],
  riskLevel: "T1 (Priority: 20)"
});

// -----------------------------------------------------------------------------
// 3. 스킬 노드 생성
// -----------------------------------------------------------------------------

// 기술 스킬들
CREATE (:Skill {id: "neo4j", name: "Neo4j", category: "Database", type: "Technical", difficulty: 8, marketValue: 9});
CREATE (:Skill {id: "cypher", name: "Cypher", category: "Query Language", type: "Technical", difficulty: 7, marketValue: 8});
CREATE (:Skill {id: "nextjs", name: "Next.js", category: "Frontend Framework", type: "Technical", difficulty: 6, marketValue: 9});
CREATE (:Skill {id: "typescript", name: "TypeScript", category: "Programming Language", type: "Technical", difficulty: 5, marketValue: 9});
CREATE (:Skill {id: "firebase", name: "Firebase", category: "Backend Service", type: "Technical", difficulty: 5, marketValue: 8});
CREATE (:Skill {id: "terraform", name: "Terraform", category: "Infrastructure as Code", type: "Technical", difficulty: 7, marketValue: 9});
CREATE (:Skill {id: "gcp", name: "Google Cloud Platform", category: "Cloud Platform", type: "Technical", difficulty: 8, marketValue: 9});
CREATE (:Skill {id: "git", name: "Git", category: "Version Control", type: "Technical", difficulty: 4, marketValue: 8});
CREATE (:Skill {id: "github", name: "GitHub", category: "Development Platform", type: "Technical", difficulty: 3, marketValue: 8});

// AI/ML 스킬들
CREATE (:Skill {id: "ai_prompt_engineering", name: "AI Prompt Engineering", category: "AI/ML", type: "Technical", difficulty: 6, marketValue: 10});
CREATE (:Skill {id: "graph_databases", name: "Graph Databases", category: "Database", type: "Technical", difficulty: 8, marketValue: 9});
CREATE (:Skill {id: "knowledge_graphs", name: "Knowledge Graphs", category: "AI/ML", type: "Technical", difficulty: 9, marketValue: 10});

// 소프트 스킬들
CREATE (:Skill {id: "project_management", name: "Project Management", category: "Management", type: "Soft", difficulty: 6, marketValue: 8});
CREATE (:Skill {id: "ai_governance", name: "AI Governance", category: "Management", type: "Soft", difficulty: 8, marketValue: 10});
CREATE (:Skill {id: "strategic_planning", name: "Strategic Planning", category: "Management", type: "Soft", difficulty: 7, marketValue: 9});

// -----------------------------------------------------------------------------
// 4. 개념 노드 생성
// -----------------------------------------------------------------------------

// 핵심 아키텍처 개념들
CREATE (:Concept {
  id: "ai_assembly_line", 
  name: "AI Specialist Assembly Line",
  category: "Architecture",
  difficulty: 9,
  description: "3단계 직렬 AI 전문가 프로세스 (Infrastructure → Application → Optimization)",
  importance: 10,
  innovation: 10
});

CREATE (:Concept {
  id: "trinity_state_machine",
  name: "Trinity State Machine", 
  category: "Architecture",
  difficulty: 8,
  description: "GitHub(코드) + Notion(거버넌스) + Neo4j(지식) 삼위일체 상태 기계",
  importance: 10,
  innovation: 9
});

CREATE (:Concept {
  id: "knowledge_generation_architecture",
  name: "Knowledge Generation Architecture",
  category: "AI/ML",
  difficulty: 9,
  description: "개발 활동을 실시간으로 지식 그래프로 변환하는 아키텍처",
  importance: 9,
  innovation: 10
});

CREATE (:Concept {
  id: "secure_state_handoff",
  name: "Secure State Handoff (T1 Risk)",
  category: "Security",
  difficulty: 8,
  description: "AI 에이전트 간 민감정보 안전 전달 메커니즘",
  importance: 9,
  innovation: 8
});

CREATE (:Concept {
  id: "dual_architecture",
  name: "Dual Architecture Blueprint", 
  category: "Architecture",
  difficulty: 9,
  description: "개발 아키텍처(AI Assembly Line) + 운영 아키텍처(Trinity State Machine)",
  importance: 10,
  innovation: 10
});

// 기술적 개념들
CREATE (:Concept {id: "graph_schema_design", name: "Graph Schema Design", category: "Database", difficulty: 7, importance: 8});
CREATE (:Concept {id: "real_time_knowledge_extraction", name: "Real-time Knowledge Extraction", category: "AI/ML", difficulty: 8, importance: 9});
CREATE (:Concept {id: "multi_agent_collaboration", name: "Multi-Agent Collaboration", category: "AI/ML", difficulty: 9, importance: 9});

// -----------------------------------------------------------------------------
// 5. 커밋 노드 생성 (실제 Git 히스토리 기반)
// -----------------------------------------------------------------------------

CREATE (:Commit {
  hash: "df86cd5",
  message: "docs: 제미나이 애플리케이션 개발자 에이전트 초기화 컨텍스트 및 프롬프트 생성",
  timestamp: datetime("2025-01-15T12:30:00Z"),
  author: "code_architect_ai",
  linesAdded: 316,
  linesDeleted: 0,
  filesModified: 2,
  changeType: "Feature",
  impact: "High"
});

CREATE (:Commit {
  hash: "3049d4c", 
  message: "docs: LOG1 팀스페이스 노션 분석 및 현황 보고서 완성",
  timestamp: datetime("2025-01-15T11:45:00Z"),
  author: "code_architect_ai",
  linesAdded: 500,
  linesDeleted: 0,
  filesModified: 2,
  changeType: "Feature",
  impact: "High"
});

CREATE (:Commit {
  hash: "fbf60d5",
  message: "merge: 원격 변경사항과 지식 아키텍처 병합",
  timestamp: datetime("2025-01-15T10:15:00Z"),
  author: "code_architect_ai", 
  linesAdded: 50,
  linesDeleted: 0,
  filesModified: 3,
  changeType: "Merge",
  impact: "Medium"
});

CREATE (:Commit {
  hash: "8e3da83",
  message: "feat: 고도화된 지식 생성 아키텍처 설계 완료",
  timestamp: datetime("2025-01-15T09:30:00Z"),
  author: "code_architect_ai",
  linesAdded: 800,
  linesDeleted: 20,
  filesModified: 4,
  changeType: "Feature", 
  impact: "Critical"
});

CREATE (:Commit {
  hash: "ff4e7a3",
  message: "feat: Add T1 Risk Verification PoC for secure state transfer",
  timestamp: datetime("2025-01-15T08:00:00Z"),
  author: "infra_architect_ai",
  linesAdded: 200,
  linesDeleted: 0,
  filesModified: 3,
  changeType: "Feature",
  impact: "High"
});

CREATE (:Commit {
  hash: "a489718",
  message: "feat: 프로젝트 설정 및 Neo4j 연결 구성 완료",
  timestamp: datetime("2025-01-15T07:15:00Z"),
  author: "code_architect_ai",
  linesAdded: 150,
  linesDeleted: 0,
  filesModified: 2,
  changeType: "Feature",
  impact: "Medium"
});

CREATE (:Commit {
  hash: "974f84f",
  message: "feat: Phase 0 PoC - 지식 생성 아키텍처 Neo4j 스키마 설계",
  timestamp: datetime("2025-01-15T06:00:00Z"),
  author: "code_architect_ai",
  linesAdded: 235,
  linesDeleted: 0,
  filesModified: 1,
  changeType: "Feature",
  impact: "Critical"
});

// -----------------------------------------------------------------------------
// 6. 파일 노드 생성
// -----------------------------------------------------------------------------

// 핵심 스키마 파일
CREATE (:File {
  path: "poc/knowledge_schema/schema.cypher",
  name: "schema.cypher",
  extension: "cypher",
  type: "Database Schema",
  size: 6500,
  complexity: 8,
  importance: 10,
  lastModified: datetime("2025-01-15T06:00:00Z"),
  language: "Cypher"
});

// 설정 파일들
CREATE (:File {
  path: "config/project_config.json",
  name: "project_config.json", 
  extension: "json",
  type: "Configuration",
  size: 2100,
  complexity: 5,
  importance: 8,
  lastModified: datetime("2025-01-15T07:15:00Z"),
  language: "JSON"
});

// 문서 파일들
CREATE (:File {
  path: "docs/architecture_overview.md",
  name: "architecture_overview.md",
  extension: "md",
  type: "Documentation",
  size: 3200,
  complexity: 6,
  importance: 8,
  lastModified: datetime("2025-01-15T09:30:00Z"),
  language: "Markdown"
});

CREATE (:File {
  path: "docs/notion_analysis_report.md",
  name: "notion_analysis_report.md",
  extension: "md", 
  type: "Documentation",
  size: 12000,
  complexity: 7,
  importance: 9,
  lastModified: datetime("2025-01-15T11:45:00Z"),
  language: "Markdown"
});

CREATE (:File {
  path: "docs/gemini_agent_initialization.md",
  name: "gemini_agent_initialization.md",
  extension: "md",
  type: "Documentation",
  size: 8500,
  complexity: 6,
  importance: 8,
  lastModified: datetime("2025-01-15T12:30:00Z"),
  language: "Markdown"
});

CREATE (:File {
  path: "README.md",
  name: "README.md",
  extension: "md",
  type: "Documentation",
  size: 2500,
  complexity: 4,
  importance: 7,
  lastModified: datetime("2025-01-15T07:15:00Z"),
  language: "Markdown"
});

// -----------------------------------------------------------------------------
// 7. 세션 노드 생성
// -----------------------------------------------------------------------------

CREATE (:Session {
  id: "session_001",
  name: "지식 아키텍처 설계 세션",
  startTime: datetime("2025-01-15T06:00:00Z"),
  endTime: datetime("2025-01-15T09:00:00Z"),
  duration: 180,
  type: "Development",
  productivity: 95,
  focus: ["Neo4j Schema Design", "Knowledge Architecture"],
  outcome: "Complete graph schema created"
});

CREATE (:Session {
  id: "session_002", 
  name: "Notion 분석 세션",
  startTime: datetime("2025-01-15T10:00:00Z"),
  endTime: datetime("2025-01-15T12:00:00Z"),
  duration: 120,
  type: "Analysis",
  productivity: 90,
  focus: ["Project Planning", "Strategic Analysis"],
  outcome: "Comprehensive project understanding achieved"
});

CREATE (:Session {
  id: "session_003",
  name: "제미나이 초기화 세션",
  startTime: datetime("2025-01-15T12:00:00Z"),
  endTime: datetime("2025-01-15T13:00:00Z"),
  duration: 60,
  type: "Configuration",
  productivity: 85,
  focus: ["AI Agent Setup", "Context Creation"],
  outcome: "Gemini agent initialization context completed"
});

// -----------------------------------------------------------------------------
// 8. 패턴 노드 생성
// -----------------------------------------------------------------------------

CREATE (:Pattern {
  id: "ai_specialization_pattern",
  name: "AI Agent Specialization Pattern",
  type: "Architectural",
  category: "AI Design",
  description: "각 AI 에이전트를 특정 개발 단계에 전문화시키는 패턴",
  frequency: 5,
  effectiveness: 9,
  complexity: 7
});

CREATE (:Pattern {
  id: "secure_handoff_pattern",
  name: "Secure State Handoff Pattern", 
  type: "Security",
  category: "Architecture",
  description: "민감한 상태 정보를 AI 에이전트 간 안전하게 전달하는 패턴",
  frequency: 3,
  effectiveness: 8,
  complexity: 8
});

CREATE (:Pattern {
  id: "knowledge_extraction_pattern",
  name: "Real-time Knowledge Extraction Pattern",
  type: "Data Processing",
  category: "AI/ML",
  description: "개발 활동을 실시간으로 지식 그래프로 변환하는 패턴",
  frequency: 4,
  effectiveness: 9,
  complexity: 9
});

// -----------------------------------------------------------------------------
// 9. 이슈 노드 생성
// -----------------------------------------------------------------------------

CREATE (:Issue {
  id: "issue_t1_risk",
  title: "T1 Risk: 민감정보 안전 전달", 
  description: "Stage 1→2 전환 시 민감정보 유출 위험",
  type: "Security Risk",
  priority: "Critical",
  status: "In Progress",
  riskLevel: 20,
  impact: "High",
  probability: 4,
  mitigation: "Terraform Remote State + GCP Secret Manager"
});

CREATE (:Issue {
  id: "issue_t2_risk",
  title: "T2 Risk: 클라우드-로컬 환경 불일치",
  description: "Firebase Studio와 Cursor AI 환경 간 불일치",
  type: "Technical Risk", 
  priority: "High",
  status: "Planned",
  riskLevel: 15,
  impact: "Medium",
  probability: 5,
  mitigation: "Nix 기반 선언적 환경 관리"
});

CREATE (:Issue {
  id: "issue_performance",
  title: "Neo4j 쿼리 성능 최적화",
  description: "복잡한 지식 추출 쿼리의 성능 최적화 필요",
  type: "Performance",
  priority: "Medium",
  status: "Pending",
  riskLevel: 8,
  impact: "Medium",
  probability: 3,
  mitigation: "인덱스 최적화 및 쿼리 튜닝"
});

// -----------------------------------------------------------------------------
// 10. 기본 관계 생성
// -----------------------------------------------------------------------------

// 개발자-프로젝트 관계
MATCH (d:Developer {id: "code_architect_ai"}), (p:Project {id: "mindlog_v4"})
CREATE (d)-[:WORKS_ON {role: "Lead Architect", startDate: "2025-01-15", contribution: 95, responsibility: "Knowledge Architecture & Schema Design"}]->(p);

MATCH (d:Developer {id: "infra_architect_ai"}), (p:Project {id: "t1_risk_verification"})
CREATE (d)-[:WORKS_ON {role: "Infrastructure Lead", startDate: "2025-01-15", contribution: 90, responsibility: "Secure State Transfer & IaC"}]->(p);

MATCH (d:Developer {id: "app_developer_ai"}), (p:Project {id: "mindlog_v4"})
CREATE (d)-[:WORKS_ON {role: "Application Developer", startDate: "2025-01-15", contribution: 0, responsibility: "Full-Stack Application Development"}]->(p);

MATCH (d:Developer {id: "vice_director"}), (p:Project {id: "mindlog_v4"})
CREATE (d)-[:WORKS_ON {role: "Project Director", startDate: "2024-01-01", contribution: 100, responsibility: "Strategic Leadership & Decision Making"}]->(p);

// 개발자-스킬 관계
MATCH (d:Developer {id: "code_architect_ai"}), (s:Skill {id: "neo4j"})
CREATE (d)-[:HAS_SKILL {level: "Expert", acquiredDate: "2025-01-15", lastUsed: "2025-01-15", proficiency: 95}]->(s);

MATCH (d:Developer {id: "code_architect_ai"}), (s:Skill {id: "knowledge_graphs"})
CREATE (d)-[:HAS_SKILL {level: "Expert", acquiredDate: "2025-01-15", lastUsed: "2025-01-15", proficiency: 90}]->(s);

MATCH (d:Developer {id: "infra_architect_ai"}), (s:Skill {id: "terraform"})
CREATE (d)-[:HAS_SKILL {level: "Expert", acquiredDate: "2025-01-15", lastUsed: "2025-01-15", proficiency: 95}]->(s);

MATCH (d:Developer {id: "infra_architect_ai"}), (s:Skill {id: "gcp"})
CREATE (d)-[:HAS_SKILL {level: "Expert", acquiredDate: "2025-01-15", lastUsed: "2025-01-15", proficiency: 90}]->(s);

// 커밋-개발자 관계
MATCH (c:Commit {hash: "df86cd5"}), (d:Developer {id: "code_architect_ai"})
CREATE (d)-[:AUTHORED {timestamp: datetime("2025-01-15T12:30:00Z"), linesAdded: 316, linesDeleted: 0, effort: 60}]->(c);

MATCH (c:Commit {hash: "3049d4c"}), (d:Developer {id: "code_architect_ai"})
CREATE (d)-[:AUTHORED {timestamp: datetime("2025-01-15T11:45:00Z"), linesAdded: 500, linesDeleted: 0, effort: 90}]->(c);

MATCH (c:Commit {hash: "ff4e7a3"}), (d:Developer {id: "infra_architect_ai"})
CREATE (d)-[:AUTHORED {timestamp: datetime("2025-01-15T08:00:00Z"), linesAdded: 200, linesDeleted: 0, effort: 45}]->(c);

// 커밋-파일 관계
MATCH (c:Commit {hash: "974f84f"}), (f:File {path: "poc/knowledge_schema/schema.cypher"})
CREATE (c)-[:MODIFIES {linesAdded: 235, linesDeleted: 0, changeType: "CREATE", significance: "Critical"}]->(f);

MATCH (c:Commit {hash: "3049d4c"}), (f:File {path: "docs/notion_analysis_report.md"})
CREATE (c)-[:MODIFIES {linesAdded: 259, linesDeleted: 0, changeType: "CREATE", significance: "High"}]->(f);

// 개발자-개념 학습 관계
MATCH (d:Developer {id: "code_architect_ai"}), (c:Concept {id: "knowledge_generation_architecture"})
CREATE (d)-[:LEARNED {learnedDate: "2025-01-15", masteryLevel: 90, timeSpent: 180, method: "Design & Implementation"}]->(c);

MATCH (d:Developer {id: "code_architect_ai"}), (c:Concept {id: "ai_assembly_line"})
CREATE (d)-[:LEARNED {learnedDate: "2025-01-15", masteryLevel: 85, timeSpent: 120, method: "Analysis & Documentation"}]->(c);

// 세션-개념 관계
MATCH (s:Session {id: "session_001"}), (c:Concept {id: "knowledge_generation_architecture"})
CREATE (s)-[:FOCUSED_ON {duration: 180, intensity: 95, outcome: "Complete architecture designed"}]->(c);

MATCH (s:Session {id: "session_002"}), (c:Concept {id: "ai_assembly_line"})
CREATE (s)-[:FOCUSED_ON {duration: 60, intensity: 80, outcome: "Comprehensive understanding achieved"}]->(c);

// 프로젝트-개념 관계
MATCH (p:Project {id: "mindlog_v4"}), (c:Concept {id: "dual_architecture"})
CREATE (p)-[:IMPLEMENTS {implementationDate: "2025-01-15", completeness: 30, priority: "Critical"}]->(c);

// 이슈-프로젝트 관계
MATCH (i:Issue {id: "issue_t1_risk"}), (p:Project {id: "t1_risk_verification"})
CREATE (i)-[:PART_OF {severity: "Critical", impact: "Security", priority: 20}]->(p);

MATCH (i:Issue {id: "issue_t1_risk"}), (d:Developer {id: "infra_architect_ai"})
CREATE (i)-[:ASSIGNED_TO {assignedDate: "2025-01-15", estimatedHours: 40, urgency: "High"}]->(d);

// 파일-프로젝트 관계
MATCH (f:File {path: "poc/knowledge_schema/schema.cypher"}), (p:Project {id: "poc_knowledge_schema"})
CREATE (p)-[:CONTAINS {importance: "Critical", fileType: "Core Schema", size: 6500}]->(f);

// -----------------------------------------------------------------------------
// 11. 지식 추출을 위한 고급 관계 생성
// -----------------------------------------------------------------------------

// 스킬 요구사항 관계
MATCH (c:Concept {id: "knowledge_generation_architecture"}), (s:Skill {id: "neo4j"})
CREATE (c)-[:REQUIRES {importance: 9, proficiencyLevel: "Expert", criticality: "High"}]->(s);

MATCH (c:Concept {id: "ai_assembly_line"}), (s:Skill {id: "ai_prompt_engineering"})
CREATE (c)-[:REQUIRES {importance: 8, proficiencyLevel: "Advanced", criticality: "High"}]->(s);

// 패턴 적용 관계
MATCH (pat:Pattern {id: "knowledge_extraction_pattern"}), (p:Project {id: "mindlog_v4"})
CREATE (pat)-[:APPLIED_IN {applicationDate: "2025-01-15", effectiveness: 9, frequency: 4}]->(p);

// 개념 간 의존성
MATCH (c1:Concept {id: "trinity_state_machine"}), (c2:Concept {id: "ai_assembly_line"})
CREATE (c1)-[:DEPENDS_ON {dependencyType: "Architectural", strength: 8, relationship: "Complementary"}]->(c2);

// =============================================================================
// Seed Content 생성 완료
// =============================================================================

// 생성된 데이터 요약 확인
MATCH (n) 
RETURN labels(n)[0] as NodeType, count(n) as Count 
ORDER BY Count DESC;