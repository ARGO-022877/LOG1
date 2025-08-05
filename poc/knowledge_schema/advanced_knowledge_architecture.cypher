// =============================================================================
// 마음로그 V4.0 - 고도화된 지식 생성 아키텍처 (Advanced Knowledge Architecture)
// Claude 4 Opus Max 기반 지능형 학습 시스템
// =============================================================================

// -----------------------------------------------------------------------------
// I. AI 기반 지식 진화 노드 정의
// -----------------------------------------------------------------------------

// KnowledgeGraph: 메타 지식 그래프 노드
CREATE CONSTRAINT kg_id_unique IF NOT EXISTS FOR (kg:KnowledgeGraph) REQUIRE kg.id IS UNIQUE;
CREATE INDEX kg_evolution_index IF NOT EXISTS FOR (kg:KnowledgeGraph) ON (kg.evolutionStage);

// LearningPath: 동적 학습 경로 노드
CREATE CONSTRAINT path_id_unique IF NOT EXISTS FOR (lp:LearningPath) REQUIRE lp.id IS UNIQUE;
CREATE INDEX path_efficiency_index IF NOT EXISTS FOR (lp:LearningPath) ON (lp.efficiency);

// KnowledgeState: 시점별 지식 상태 스냅샷
CREATE CONSTRAINT state_id_unique IF NOT EXISTS FOR (ks:KnowledgeState) REQUIRE ks.id IS UNIQUE;
CREATE INDEX state_timestamp_index IF NOT EXISTS FOR (ks:KnowledgeState) ON (ks.timestamp);

// CognitivePattern: 인지 패턴 및 사고 구조
CREATE CONSTRAINT cognitive_id_unique IF NOT EXISTS FOR (cp:CognitivePattern) REQUIRE cp.id IS UNIQUE;
CREATE INDEX cognitive_type_index IF NOT EXISTS FOR (cp:CognitivePattern) ON (cp.patternType);

// LearningEvidence: 학습 증거 및 성과 지표
CREATE CONSTRAINT evidence_id_unique IF NOT EXISTS FOR (le:LearningEvidence) REQUIRE le.id IS UNIQUE;
CREATE INDEX evidence_quality_index IF NOT EXISTS FOR (le:LearningEvidence) ON (le.evidenceQuality);

// AdaptiveRecommendation: 적응형 추천 노드
CREATE CONSTRAINT rec_id_unique IF NOT EXISTS FOR (ar:AdaptiveRecommendation) REQUIRE ar.id IS UNIQUE;
CREATE INDEX rec_relevance_index IF NOT EXISTS FOR (ar:AdaptiveRecommendation) ON (ar.relevanceScore);

// MetaLearning: 메타 학습 노드 (학습에 대한 학습)
CREATE CONSTRAINT meta_id_unique IF NOT EXISTS FOR (ml:MetaLearning) REQUIRE ml.id IS UNIQUE;
CREATE INDEX meta_level_index IF NOT EXISTS FOR (ml:MetaLearning) ON (ml.learningLevel);

// KnowledgeCluster: 지식 클러스터 (관련 개념 그룹)
CREATE CONSTRAINT cluster_id_unique IF NOT EXISTS FOR (kc:KnowledgeCluster) REQUIRE kc.id IS UNIQUE;
CREATE INDEX cluster_coherence_index IF NOT EXISTS FOR (kc:KnowledgeCluster) ON (kc.coherenceScore);

// -----------------------------------------------------------------------------
// II. 시간적 진화 및 버전 관리 노드
// -----------------------------------------------------------------------------

// ConceptEvolution: 개념의 시간적 진화 추적
CREATE CONSTRAINT concept_evo_id_unique IF NOT EXISTS FOR (ce:ConceptEvolution) REQUIRE ce.id IS UNIQUE;
CREATE INDEX concept_evo_version_index IF NOT EXISTS FOR (ce:ConceptEvolution) ON (ce.version);

// SkillMaturation: 스킬의 성숙도 진화
CREATE CONSTRAINT skill_mat_id_unique IF NOT EXISTS FOR (sm:SkillMaturation) REQUIRE sm.id IS UNIQUE;
CREATE INDEX skill_mat_stage_index IF NOT EXISTS FOR (sm:SkillMaturation) ON (sm.maturationStage);

// LearningMilestone: 학습 이정표 및 성취점
CREATE CONSTRAINT milestone_id_unique IF NOT EXISTS FOR (lm:LearningMilestone) REQUIRE lm.id IS UNIQUE;
CREATE INDEX milestone_significance_index IF NOT EXISTS FOR (lm:LearningMilestone) ON (lm.significance);

// -----------------------------------------------------------------------------
// III. AI 분석 및 예측 노드
// -----------------------------------------------------------------------------

// PredictiveModel: 학습 성과 예측 모델
CREATE CONSTRAINT model_id_unique IF NOT EXISTS FOR (pm:PredictiveModel) REQUIRE pm.id IS UNIQUE;
CREATE INDEX model_accuracy_index IF NOT EXISTS FOR (pm:PredictiveModel) ON (pm.accuracy);

// LearningAnalytics: 학습 분석 결과
CREATE CONSTRAINT analytics_id_unique IF NOT EXISTS FOR (la:LearningAnalytics) REQUIRE la.id IS UNIQUE;
CREATE INDEX analytics_insight_index IF NOT EXISTS FOR (la:LearningAnalytics) ON (la.insightLevel);

// PerformancePredictor: 성과 예측기
CREATE CONSTRAINT predictor_id_unique IF NOT EXISTS FOR (pp:PerformancePredictor) REQUIRE pp.id IS UNIQUE;
CREATE INDEX predictor_confidence_index IF NOT EXISTS FOR (pp:PerformancePredictor) ON (pp.confidence);

// -----------------------------------------------------------------------------
// IV. 고급 관계 타입 정의 - 지식 진화
// -----------------------------------------------------------------------------

// 지식 진화 관계
// (:Concept)-[:EVOLVES_TO {confidence, timespan}]->(:ConceptEvolution)
// (:KnowledgeState)-[:TRANSITIONS_TO {trigger, probability}]->(:KnowledgeState)
// (:LearningPath)-[:ADAPTS_TO {efficiency_gain, adaptation_reason}]->(:LearningPath)
// (:Skill)-[:MATURES_INTO {maturation_factor, evidence_strength}]->(:SkillMaturation)

// AI 학습 메커니즘 관계
// (:Developer)-[:GENERATES_PATTERN {discovery_method, pattern_strength}]->(:CognitivePattern)
// (:LearningEvidence)-[:SUPPORTS {support_strength, reliability}]->(:Concept)
// (:PredictiveModel)-[:PREDICTS {prediction_horizon, confidence_interval}]->(:LearningOutcome)
// (:AdaptiveRecommendation)-[:SUGGESTS {personalization_score, urgency}]->(:LearningPath)

// 메타 학습 관계
// (:MetaLearning)-[:OPTIMIZES {optimization_metric, improvement_rate}]->(:LearningStrategy)
// (:LearningAnalytics)-[:INFORMS {insight_quality, actionability}]->(:AdaptiveRecommendation)
// (:CognitivePattern)-[:EMERGES_FROM {emergence_strength, observation_count}]->(:Session)

// 클러스터링 및 연관성 관계
// (:Concept)-[:CLUSTERS_WITH {similarity_score, cluster_strength}]->(:KnowledgeCluster)
// (:KnowledgeCluster)-[:CONTAINS_INSIGHTS {insight_density, coherence}]->(:LearningEvidence)
// (:LearningMilestone)-[:MARKS_TRANSITION {significance_level, impact_scope}]->(:SkillMaturation)

// -----------------------------------------------------------------------------
// V. 지능형 속성 정의
// -----------------------------------------------------------------------------

// KnowledgeGraph 노드 속성
// {
//   id: "kg_001",
//   name: "JavaScript 생태계 지식맵",
//   evolutionStage: "mature", // nascent, developing, mature, declining
//   nodes: 1250,
//   relationships: 3420,
//   density: 0.87,
//   centralityConcepts: ["React", "Node.js", "ES6"],
//   emergingConcepts: ["Deno", "Svelte"],
//   lastEvolution: "2024-01-15T10:30:00Z",
//   adaptationRate: 0.23
// }

// LearningPath 노드 속성
// {
//   id: "path_001",
//   name: "Full Stack JavaScript 마스터리",
//   targetDeveloper: "dev001",
//   difficulty: "intermediate",
//   estimatedDuration: 180, // days
//   efficiency: 0.85,
//   adaptationCount: 12,
//   successRate: 0.78,
//   prerequisites: ["con001", "con002"],
//   milestones: ["milestone001", "milestone002"],
//   personalizedWeight: 0.92
// }

// CognitivePattern 노드 속성
// {
//   id: "pattern_001", 
//   patternType: "problem_solving", // problem_solving, knowledge_acquisition, skill_transfer
//   strength: 0.89,
//   frequency: 45,
//   discoveryMethod: "temporal_analysis",
//   triggerConditions: ["complex_debugging", "new_framework"],
//   outcomes: ["improved_efficiency", "reduced_errors"],
//   reliability: 0.82,
//   applicabilityScope: ["backend", "frontend"]
// }

// LearningEvidence 노드 속성
// {
//   id: "evidence_001",
//   evidenceType: "performance_improvement", // code_quality, performance_improvement, knowledge_demonstration
//   evidenceQuality: 0.91,
//   sourceType: "commit_analysis", // commit_analysis, session_observation, peer_review
//   measuredImprovement: 0.34,
//   reliability: 0.87,
//   timeframe: "2_weeks",
//   verificationMethod: "automated_metrics",
//   linkedConcepts: ["con001", "con003"]
// }

// -----------------------------------------------------------------------------
// VI. 동적 지식 생성 쿼리 템플릿
// -----------------------------------------------------------------------------

// 1. 개인화된 학습 경로 생성
// MATCH (d:Developer {id: $developerId})-[:HAS_SKILL]->(s:Skill)
// MATCH (d)-[:LEARNED]->(c:Concept)
// MATCH (target:Concept) WHERE NOT (d)-[:LEARNED]->(target)
// WITH d, s, c, target, 
//      gds.similarity.cosine(s.proficiencyVector, target.requiredSkillVector) as skillMatch
// OPTIONAL MATCH (c)-[:PREREQUISITE_OF*1..3]->(target)
// WITH d, target, skillMatch, count(c) as prerequisitesMet
// CALL apoc.ml.predict.concept_readiness(d.learningProfile, target.attributes) YIELD readiness
// RETURN target.name, skillMatch, prerequisitesMet, readiness
// ORDER BY readiness DESC, skillMatch DESC
// LIMIT 5;

// 2. 지식 진화 패턴 발견
// MATCH (ce:ConceptEvolution)-[:EVOLVES_FROM]->(c:Concept)
// WHERE ce.timestamp > datetime() - duration('P30D')
// WITH c, ce, 
//      [(ce)-[:INFLUENCED_BY]->(factor) | factor.name] as evolutionFactors
// MATCH (c)<-[:LEARNED]-(d:Developer)
// WITH c, ce, evolutionFactors, count(d) as learnerCount
// RETURN c.name, ce.evolutionTrigger, evolutionFactors, learnerCount,
//        ce.evolutionSpeed, ce.adoptionRate
// ORDER BY ce.evolutionSpeed DESC;

// 3. 적응형 추천 생성
// MATCH (d:Developer {id: $developerId})
// MATCH (d)-[:EXHIBITS_PATTERN]->(cp:CognitivePattern)
// MATCH (similar:Developer)-[:EXHIBITS_PATTERN]->(cp)
// WHERE similar <> d
// MATCH (similar)-[:SUCCEEDED_IN]->(lp:LearningPath)
// WHERE NOT (d)-[:ATTEMPTED]->(lp)
// WITH d, lp, cp, count(similar) as similarDevelopers,
//      avg(lp.successRate) as avgSuccess
// CALL apoc.ml.recommend.learning_path(d.profile, lp.attributes, cp.strength) 
// YIELD relevanceScore
// CREATE (ar:AdaptiveRecommendation {
//   id: apoc.create.uuid(),
//   targetDeveloper: d.id,
//   recommendedPath: lp.id,
//   relevanceScore: relevanceScore,
//   confidence: avgSuccess * (similarDevelopers / 10.0),
//   generatedAt: datetime(),
//   reasoning: "Based on " + similarDevelopers + " similar cognitive patterns"
// })
// CREATE (d)-[:RECEIVES_RECOMMENDATION]->(ar)-[:SUGGESTS]->(lp);

// 4. 메타 학습 분석
// MATCH (d:Developer)-[:PARTICIPATED_IN]->(s:Session)
// WHERE s.startTime > datetime() - duration('P7D')
// WITH d, s,
//      s.productivity as sessionProductivity,
//      s.focusLevel as sessionFocus,
//      [(s)-[:FOCUSED_ON]->(c:Concept) | c.difficulty] as conceptDifficulties
// WITH d, avg(sessionProductivity) as avgProductivity,
//      avg(sessionFocus) as avgFocus,
//      avg([diff IN conceptDifficulties | diff]) as avgDifficulty
// MATCH (d)-[:HAS_META_PATTERN]->(ml:MetaLearning)
// SET ml.weeklyProductivity = avgProductivity,
//     ml.weeklyFocus = avgFocus,
//     ml.weeklyChallenge = avgDifficulty,
//     ml.learningEfficiency = avgProductivity / avgDifficulty,
//     ml.lastAnalysis = datetime()
// RETURN d.name, ml.learningEfficiency, ml.weeklyProductivity, ml.weeklyFocus;

// 5. 지식 클러스터 자동 생성
// MATCH (c1:Concept)-[:RELATED_TO]-(c2:Concept)
// WHERE c1.id < c2.id
// WITH c1, c2, 
//      gds.similarity.jaccard(c1.relatedSkills, c2.relatedSkills) as skillSimilarity,
//      gds.similarity.cosine(c1.semanticVector, c2.semanticVector) as conceptSimilarity
// WHERE skillSimilarity > 0.7 OR conceptSimilarity > 0.8
// WITH collect({concept1: c1, concept2: c2, similarity: skillSimilarity + conceptSimilarity}) as conceptPairs
// CALL apoc.ml.cluster.concepts(conceptPairs) YIELD clusterId, concepts, coherenceScore
// CREATE (kc:KnowledgeCluster {
//   id: clusterId,
//   concepts: [c IN concepts | c.id],
//   coherenceScore: coherenceScore,
//   size: size(concepts),
//   createdAt: datetime(),
//   domain: concepts[0].category
// })
// WITH kc, concepts
// UNWIND concepts as concept
// CREATE (concept)-[:BELONGS_TO_CLUSTER {membership_strength: coherenceScore}]->(kc);

// -----------------------------------------------------------------------------
// VII. 학습 성과 예측 모델 스키마
// -----------------------------------------------------------------------------

// PredictiveModel 노드 상세 속성
// {
//   id: "model_skill_progression_v2",
//   modelType: "skill_progression", // skill_progression, concept_mastery, performance_prediction
//   algorithm: "neural_network", // neural_network, random_forest, gradient_boosting
//   accuracy: 0.87,
//   precision: 0.84,
//   recall: 0.89,
//   f1Score: 0.865,
//   trainingData: 15420, // number of training samples
//   features: ["practice_frequency", "concept_difficulty", "prior_knowledge", "cognitive_pattern"],
//   lastTraining: "2024-01-10T15:30:00Z",
//   modelVersion: "2.1.3",
//   hyperparameters: {
//     "learning_rate": 0.001,
//     "batch_size": 64,
//     "hidden_layers": [128, 64, 32]
//   }
// }

// -----------------------------------------------------------------------------
// VIII. 실시간 지식 상태 모니터링
// -----------------------------------------------------------------------------

// KnowledgeState 시계열 분석을 위한 인덱스
CREATE INDEX state_developer_time_index IF NOT EXISTS FOR (ks:KnowledgeState) ON (ks.developerId, ks.timestamp);

// 실시간 상태 업데이트 쿼리 템플릿
// MATCH (d:Developer {id: $developerId})
// CREATE (ks:KnowledgeState {
//   id: apoc.create.uuid(),
//   developerId: d.id,
//   timestamp: datetime(),
//   overallCompetency: $competencyScore,
//   skillDistribution: $skillVector,
//   knowledgeGaps: $identifiedGaps,
//   learningMomentum: $momentum,
//   conceptMastery: $masteryLevels,
//   predictedTrajectory: $trajectory,
//   confidenceLevel: $confidence
// })
// CREATE (d)-[:HAS_STATE {created_at: datetime()}]->(ks);

// -----------------------------------------------------------------------------
// 스키마 완료 - 고도화된 지식 생성 아키텍처
// -----------------------------------------------------------------------------

// 이 고도화된 스키마는 다음을 제공합니다:
// 1. AI 기반 동적 지식 진화 추적
// 2. 개인화된 적응형 학습 경로 생성  
// 3. 메타 학습을 통한 학습 방법 최적화
// 4. 예측 모델을 통한 성과 예측
// 5. 실시간 지식 상태 모니터링
// 6. 자동화된 지식 클러스터링
// 7. 인지 패턴 기반 추천 시스템