#!/usr/bin/env python3
"""
고급 지식 추출 엔진 (Advanced Knowledge Engine)
자연어 질의를 Cypher 쿼리로 변환하고 AuraDB에서 지능적 답변 제공

주요 기능:
- 자연어 질의 분석 및 의도 파악
- 스키마 기반 동적 Cypher 쿼리 생성
- 결과 해석 및 사용자 친화적 포맷팅
- RESTful API 인터페이스 제공
"""

import os
import re
import json
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional, Tuple
from dataclasses import dataclass
from enum import Enum
from neo4j import GraphDatabase
import anthropic

# 로깅 설정
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class QueryType(Enum):
    """질의 유형 분류"""
    WHO = "who"           # 누구 (개발자, 사용자 관련)
    WHAT = "what"         # 무엇 (프로젝트, 기술, 개념 관련)
    WHEN = "when"         # 언제 (시간, 날짜 관련)
    WHERE = "where"       # 어디서 (위치, 환경 관련)
    HOW = "how"           # 어떻게 (방법, 과정 관련)
    WHY = "why"           # 왜 (이유, 원인 관련)
    COUNT = "count"       # 개수, 통계
    RECENT = "recent"     # 최근 활동
    SKILL = "skill"       # 스킬, 능력 관련
    RELATIONSHIP = "relationship"  # 관계 분석
    UNKNOWN = "unknown"   # 분류 불가

class QueryComplexity(Enum):
    """질의 복잡도"""
    SIMPLE = "simple"     # 단일 노드/관계 조회
    MEDIUM = "medium"     # 2-3개 노드 연결
    COMPLEX = "complex"   # 다중 노드, 복잡한 패턴
    ADVANCED = "advanced" # 집계, 분석, 추론 필요

@dataclass
class QueryAnalysis:
    """질의 분석 결과"""
    original_query: str
    query_type: QueryType
    complexity: QueryComplexity
    entities: List[str]
    intent: str
    keywords: List[str]
    time_constraint: Optional[str] = None
    
class AdvancedKnowledgeEngine:
    """고급 지식 추출 엔진"""
    
    def __init__(self):
        self.instance_id = "3e875bd7"
        self.uri = f"neo4j+s://{self.instance_id}.databases.neo4j.io"
        self.username = "neo4j"
        self.password = os.getenv('NEO4J_PASSWORD')
        self.driver = None
        self.schema_cache = None
        
        # Claude API 클라이언트 (향후 고급 분석용)
        self.claude_api_key = os.getenv('ANTHROPIC_API_KEY')
        self.claude_client = None
        if self.claude_api_key:
            self.claude_client = anthropic.Anthropic(api_key=self.claude_api_key)
        
        # 질의 패턴 라이브러리
        self.query_patterns = self._load_query_patterns()
        
        if not self.password:
            raise ValueError("NEO4J_PASSWORD 환경변수가 설정되지 않았습니다.")
    
    def _load_query_patterns(self) -> Dict[str, Dict]:
        """질의 패턴 라이브러리 로드"""
        return {
            # WHO 패턴들
            "recent_developer": {
                "pattern": r"(최근|마지막|가장.*최근).*작업.*개발자",
                "type": QueryType.WHO,
                "complexity": QueryComplexity.MEDIUM,
                "cypher_template": """
                    MATCH (dev:Developer)
                    OPTIONAL MATCH (dev)-[r:CREATED|AUTHORED|COMPLETED]->(activity)
                    WHERE r.timestamp IS NOT NULL
                    RETURN dev.name as developer, dev.role as role, 
                           max(r.timestamp) as last_activity,
                           count(activity) as activity_count
                    ORDER BY last_activity DESC
                    LIMIT 5
                """
            },
            
            "skilled_developer": {
                "pattern": r"(누가|어떤.*개발자).*\b(\w+)\b.*(스킬|기술|능력)",
                "type": QueryType.WHO,
                "complexity": QueryComplexity.MEDIUM,
                "cypher_template": """
                    MATCH (dev:Developer)-[r:HAS_SKILL]->(skill:Skill)
                    WHERE skill.name CONTAINS '{skill_name}' OR skill.category CONTAINS '{skill_name}'
                    RETURN dev.name as developer, dev.role as role,
                           skill.name as skill, r.level as level, r.proficiency as proficiency
                    ORDER BY r.proficiency DESC
                """
            },
            
            # WHAT 패턴들
            "project_status": {
                "pattern": r"(프로젝트|상태|진행.*상황)",
                "type": QueryType.WHAT,
                "complexity": QueryComplexity.SIMPLE,
                "cypher_template": """
                    MATCH (project:Project)
                    OPTIONAL MATCH (project)<-[:WORKS_ON]-(dev:Developer)
                    OPTIONAL MATCH (project)<-[:PART_OF]-(achievement:Achievement)
                    RETURN project.name as project, project.phase as phase,
                           project.status as status, count(dev) as developers,
                           count(achievement) as achievements
                """
            },
            
            "latest_achievements": {
                "pattern": r"(최근.*성과|성취|완료.*작업)",
                "type": QueryType.WHAT,
                "complexity": QueryComplexity.MEDIUM,
                "cypher_template": """
                    MATCH (achievement:Achievement)
                    WHERE achievement.completed_date IS NOT NULL
                    RETURN achievement.name as achievement, achievement.description as description,
                           achievement.completed_date as completed_date,
                           achievement.importance as importance
                    ORDER BY achievement.completed_date DESC
                    LIMIT 10
                """
            },
            
            # COUNT 패턴들
            "skill_count": {
                "pattern": r"(몇.*개|개수|얼마나.*많은).*(스킬|기술)",
                "type": QueryType.COUNT,
                "complexity": QueryComplexity.SIMPLE,
                "cypher_template": """
                    MATCH (skill:Skill)
                    RETURN skill.category as category, count(skill) as skill_count
                    ORDER BY skill_count DESC
                """
            },
            
            "developer_count": {
                "pattern": r"(몇.*명|몇.*개|개수|전체).*(개발자|AI)",
                "type": QueryType.COUNT,
                "complexity": QueryComplexity.SIMPLE,
                "cypher_template": """
                    MATCH (dev:Developer)
                    RETURN dev.role as role, count(dev) as developer_count
                    ORDER BY developer_count DESC
                """
            },
            
            # SKILL 패턴들
            "developer_skills": {
                "pattern": r"(\w+).*개발자.*(스킬|기술|능력)",
                "type": QueryType.SKILL,
                "complexity": QueryComplexity.MEDIUM,
                "cypher_template": """
                    MATCH (dev:Developer {{id: '{dev_id}'}})-[r:HAS_SKILL]->(skill:Skill)
                    RETURN skill.name as skill, skill.category as category,
                           r.level as level, r.proficiency as proficiency
                    ORDER BY r.proficiency DESC
                """
            },
            
            "skill_based_search": {
                "pattern": r"(\w+).*(스킬|기술).*가진.*개발자",
                "type": QueryType.WHO,
                "complexity": QueryComplexity.MEDIUM,
                "cypher_template": """
                    MATCH (dev:Developer)-[r:HAS_SKILL]->(skill:Skill)
                    WHERE skill.name CONTAINS '{skill_name}' OR skill.category CONTAINS '{skill_name}'
                    RETURN dev.name as developer, dev.role as role,
                           skill.name as skill, r.level as level, r.proficiency as proficiency
                    ORDER BY r.proficiency DESC
                """
            },
            
            # RELATIONSHIP 패턴들
            "knowledge_gaps": {
                "pattern": r"(부족|격차|모자란).*(지식|기술|스킬)",
                "type": QueryType.RELATIONSHIP,
                "complexity": QueryComplexity.COMPLEX,
                "cypher_template": """
                    MATCH (dev:Developer)
                    OPTIONAL MATCH (dev)-[r:HAS_SKILL]->(skill:Skill)
                    WITH dev, count(skill) as skill_count
                    WHERE skill_count < 3
                    RETURN dev.name as developer, dev.role as role, skill_count
                    ORDER BY skill_count ASC
                """
            },
            
            "collaboration_network": {
                "pattern": r"(협업|함께.*작업|관계)",
                "type": QueryType.RELATIONSHIP,
                "complexity": QueryComplexity.COMPLEX,
                "cypher_template": """
                    MATCH (dev1:Developer)-[r:HANDS_OFF_TO|:WORKS_ON]-(dev2:Developer)
                    RETURN dev1.name as developer1, dev2.name as developer2,
                           type(r) as relationship
                """
            }
        }
    
    def connect(self) -> bool:
        """AuraDB 연결"""
        try:
            logger.info(f"🔌 고급 지식 엔진 AuraDB 연결: {self.uri}")
            self.driver = GraphDatabase.driver(self.uri, auth=(self.username, self.password))
            
            with self.driver.session() as session:
                result = session.run("RETURN 'Advanced Knowledge Engine Connected!' as status")
                status = result.single()["status"]
                logger.info(f"✅ {status}")
            
            # 스키마 캐시 로드
            self._load_schema_cache()
            return True
            
        except Exception as e:
            logger.error(f"❌ 연결 실패: {e}")
            return False
    
    def close(self):
        """연결 종료"""
        if self.driver:
            self.driver.close()
            logger.info("🔌 고급 지식 엔진 연결 종료")
    
    def _load_schema_cache(self):
        """스키마 정보 캐시 로드"""
        try:
            with self.driver.session() as session:
                # 노드 레이블 정보
                labels_result = session.run("CALL db.labels()")
                self.node_labels = [record["label"] for record in labels_result]
                
                # 관계 타입 정보
                relationships_result = session.run("CALL db.relationshipTypes()")
                self.relationship_types = [record["relationshipType"] for record in relationships_result]
                
                # 주요 속성 정보
                self.node_properties = {}
                for label in self.node_labels:
                    prop_result = session.run(f"MATCH (n:{label}) RETURN keys(n) as properties LIMIT 1")
                    record = prop_result.single()
                    if record:
                        self.node_properties[label] = record["properties"]
                
                logger.info(f"📋 스키마 캐시 로드: {len(self.node_labels)}개 노드 타입, {len(self.relationship_types)}개 관계 타입")
                
        except Exception as e:
            logger.error(f"❌ 스키마 캐시 로드 실패: {e}")
    
    def analyze_query(self, natural_query: str) -> QueryAnalysis:
        """자연어 질의 분석"""
        logger.info(f"🧠 질의 분석 시작: '{natural_query}'")
        
        # 텍스트 전처리
        clean_query = natural_query.strip().lower()
        
        # 패턴 매칭으로 질의 유형 판별
        matched_pattern = None
        query_type = QueryType.UNKNOWN
        complexity = QueryComplexity.SIMPLE
        
        for pattern_name, pattern_info in self.query_patterns.items():
            if re.search(pattern_info["pattern"], clean_query):
                matched_pattern = pattern_name
                query_type = pattern_info["type"]
                complexity = pattern_info["complexity"]
                logger.info(f"  📍 패턴 매칭: {pattern_name}")
                break
        
        # 엔티티 추출
        entities = self._extract_entities(clean_query)
        
        # 키워드 추출
        keywords = self._extract_keywords(clean_query)
        
        # 시간 제약 추출
        time_constraint = self._extract_time_constraint(clean_query)
        
        # 의도 분석
        intent = self._analyze_intent(clean_query, query_type)
        
        analysis = QueryAnalysis(
            original_query=natural_query,
            query_type=query_type,
            complexity=complexity,
            entities=entities,
            intent=intent,
            keywords=keywords,
            time_constraint=time_constraint
        )
        
        logger.info(f"  🎯 분석 결과: {query_type.value}, {complexity.value}, 엔티티 {len(entities)}개")
        return analysis
    
    def _extract_entities(self, query: str) -> List[str]:
        """엔티티 추출"""
        entities = []
        
        # 개발자명 패턴
        dev_patterns = [
            (r"infrastructure.*architect.*ai", "infrastructure"),
            (r"code.*architect.*ai", "code"), 
            (r"인프라.*아키텍트", "infrastructure"),
            (r"코드.*아키텍트", "code")
        ]
        
        for pattern, entity in dev_patterns:
            if re.search(pattern, query, re.IGNORECASE):
                entities.append(entity)
        
        # 기술/스킬명 패턴 (대소문자 무시)
        skill_patterns = [
            "terraform", "python", "neo4j", "cypher",
            "gcp", "클라우드", "보안", "파이프라인"
        ]
        
        for skill in skill_patterns:
            if skill.lower() in query.lower():
                entities.append(skill)
        
        return list(set(entities))
    
    def _extract_keywords(self, query: str) -> List[str]:
        """키워드 추출"""
        # 중요 키워드 패턴
        important_words = [
            "최근", "가장", "많은", "적은", "빠른", "느린",
            "개발자", "프로젝트", "스킬", "기술", "성과",
            "완료", "진행", "작업", "활동", "관계", "협업"
        ]
        
        keywords = []
        for word in important_words:
            if word in query:
                keywords.append(word)
        
        return keywords
    
    def _extract_time_constraint(self, query: str) -> Optional[str]:
        """시간 제약 추출"""
        time_patterns = [
            (r"최근", "recent"),
            (r"오늘", "today"),
            (r"어제", "yesterday"),
            (r"이번.*주", "this_week"),
            (r"지난.*주", "last_week"),
            (r"이번.*달", "this_month"),
            (r"지난.*달", "last_month")
        ]
        
        for pattern, time_type in time_patterns:
            if re.search(pattern, query):
                return time_type
        
        return None
    
    def _analyze_intent(self, query: str, query_type: QueryType) -> str:
        """의도 분석"""
        intent_map = {
            QueryType.WHO: "사용자가 특정 인물이나 개발자에 대한 정보를 찾고 있습니다",
            QueryType.WHAT: "사용자가 특정 사물, 프로젝트, 또는 개념에 대한 정보를 원합니다",
            QueryType.WHEN: "사용자가 시간적 정보나 일정에 대해 질문합니다",
            QueryType.COUNT: "사용자가 수량이나 통계 정보를 요구합니다",
            QueryType.SKILL: "사용자가 기술이나 능력에 대한 정보를 찾습니다",
            QueryType.RELATIONSHIP: "사용자가 관계나 연결에 대한 분석을 원합니다",
            QueryType.RECENT: "사용자가 최근 활동이나 변화를 궁금해합니다"
        }
        
        return intent_map.get(query_type, "사용자의 의도를 파악하기 어렵습니다")
    
    def generate_cypher_query(self, analysis: QueryAnalysis) -> str:
        """분석 결과를 바탕으로 Cypher 쿼리 생성"""
        logger.info(f"⚙️ Cypher 쿼리 생성: {analysis.query_type.value}")
        
        # 패턴 매칭으로 기본 쿼리 템플릿 찾기
        base_query = self._find_matching_template(analysis)
        
        # 엔티티 기반 쿼리 커스터마이징
        customized_query = self._customize_query(base_query, analysis)
        
        # 시간 제약 적용
        if analysis.time_constraint:
            customized_query = self._apply_time_constraint(customized_query, analysis.time_constraint)
        
        logger.info(f"  🔧 생성된 쿼리 길이: {len(customized_query)} 문자")
        return customized_query
    
    def _find_matching_template(self, analysis: QueryAnalysis) -> str:
        """분석 결과와 매칭되는 쿼리 템플릿 찾기"""
        # 질의 패턴 매칭
        for pattern_name, pattern_info in self.query_patterns.items():
            if re.search(pattern_info["pattern"], analysis.original_query.lower()):
                return pattern_info["cypher_template"]
        
        # 기본 폴백 쿼리들
        fallback_queries = {
            QueryType.WHO: """
                MATCH (dev:Developer)
                RETURN dev.name as name, dev.role as role, dev.status as status
                ORDER BY dev.name
            """,
            QueryType.WHAT: """
                MATCH (project:Project)
                RETURN project.name as name, project.phase as phase, project.status as status
            """,
            QueryType.COUNT: """
                MATCH (n)
                RETURN labels(n)[0] as type, count(n) as count
                ORDER BY count DESC
            """,
            QueryType.SKILL: """
                MATCH (skill:Skill)
                RETURN skill.name as skill, skill.category as category
                ORDER BY skill.name
            """
        }
        
        return fallback_queries.get(analysis.query_type, "MATCH (n) RETURN count(n) as total_nodes")
    
    def _customize_query(self, base_query: str, analysis: QueryAnalysis) -> str:
        """엔티티와 키워드를 기반으로 쿼리 커스터마이징"""
        customized = base_query
        
        # 개발자 ID 매핑
        dev_id_map = {
            "infrastructure": "infrastructure_architect_ai",
            "infra": "infrastructure_architect_ai",
            "인프라": "infrastructure_architect_ai",
            "code": "code_architect_ai", 
            "코드": "code_architect_ai"
        }
        
        # 엔티티 기반 치환
        for entity in analysis.entities:
            entity_lower = entity.lower()
            if entity_lower in dev_id_map:
                customized = customized.replace('{dev_id}', dev_id_map[entity_lower])
            # 스킬명 치환 (대소문자 고려)
            if '{skill_name}' in customized:
                # Python, python 등을 제대로 매칭하기 위해 capitalize
                skill_name = entity.capitalize() if entity.lower() == 'python' else entity
                customized = customized.replace('{skill_name}', skill_name)
        
        return customized
    
    def _apply_time_constraint(self, query: str, time_constraint: str) -> str:
        """시간 제약 조건 적용"""
        time_filters = {
            "recent": "r.timestamp > datetime() - duration('P7D')",
            "today": "date(r.timestamp) = date()",
            "this_week": "r.timestamp > datetime() - duration('P7D')",
            "this_month": "r.timestamp > datetime() - duration('P30D')"
        }
        
        time_filter = time_filters.get(time_constraint, "")
        if time_filter:
            if "WHERE" not in query:
                # WHERE 절이 없으면 추가
                query = query.replace("RETURN", f"WHERE {time_filter}\nRETURN")
            else:
                # 기존 WHERE 절에 AND로 추가
                query = query.replace("WHERE", f"WHERE {time_filter} AND")
        
        return query
    
    def execute_query(self, cypher_query: str) -> List[Dict[str, Any]]:
        """Cypher 쿼리 실행"""
        logger.info(f"🚀 쿼리 실행 시작")
        
        try:
            with self.driver.session() as session:
                result = session.run(cypher_query)
                records = []
                
                for record in result:
                    record_dict = {}
                    for key in record.keys():
                        value = record[key]
                        # datetime 객체 처리
                        if hasattr(value, 'isoformat'):
                            record_dict[key] = value.isoformat()
                        else:
                            record_dict[key] = value
                    records.append(record_dict)
                
                logger.info(f"  ✅ {len(records)}개 결과 반환")
                return records
                
        except Exception as e:
            logger.error(f"❌ 쿼리 실행 실패: {e}")
            return []
    
    def format_answer(self, query_analysis: QueryAnalysis, results: List[Dict[str, Any]]) -> Dict[str, Any]:
        """결과를 사용자 친화적으로 포맷팅"""
        logger.info(f"📝 답변 포맷팅: {len(results)}개 결과")
        
        if not results:
            return {
                "success": False,
                "message": "질문에 대한 결과를 찾을 수 없습니다.",
                "data": [],
                "query_analysis": {
                    "type": query_analysis.query_type.value,
                    "complexity": query_analysis.complexity.value,
                    "intent": query_analysis.intent
                }
            }
        
        # 질의 유형별 포맷팅
        formatted_data = self._format_by_query_type(query_analysis.query_type, results)
        
        # 요약 생성
        summary = self._generate_summary(query_analysis, results)
        
        return {
            "success": True,
            "message": summary,
            "data": formatted_data,
            "result_count": len(results),
            "query_analysis": {
                "original_query": query_analysis.original_query,
                "type": query_analysis.query_type.value,
                "complexity": query_analysis.complexity.value,
                "intent": query_analysis.intent,
                "entities_found": query_analysis.entities
            },
            "timestamp": datetime.now().isoformat()
        }
    
    def _format_by_query_type(self, query_type: QueryType, results: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """질의 유형별 결과 포맷팅"""
        if query_type == QueryType.WHO:
            return [
                {
                    "name": r.get("developer", r.get("name", "Unknown")),
                    "role": r.get("role", "Unknown"),
                    "last_activity": r.get("last_activity", "Unknown"),
                    "activity_count": r.get("activity_count", 0)
                }
                for r in results
            ]
        
        elif query_type == QueryType.COUNT:
            return [
                {
                    "category": r.get("category", r.get("type", "Unknown")),
                    "count": r.get("count", r.get("skill_count", r.get("developer_count", 0)))
                }
                for r in results
            ]
        
        elif query_type == QueryType.SKILL:
            return [
                {
                    "skill": r.get("skill", "Unknown"),
                    "category": r.get("category", "Unknown"),
                    "level": r.get("level", "Unknown"),
                    "proficiency": r.get("proficiency", 0)
                }
                for r in results
            ]
        
        else:
            return results
    
    def _generate_summary(self, query_analysis: QueryAnalysis, results: List[Dict[str, Any]]) -> str:
        """결과 요약 생성"""
        result_count = len(results)
        
        if result_count == 0:
            return "요청하신 정보를 찾을 수 없습니다."
        
        query_type = query_analysis.query_type
        
        if query_type == QueryType.WHO:
            if "최근" in query_analysis.original_query:
                top_dev = results[0] if results else {}
                return f"가장 최근에 활동한 개발자는 {top_dev.get('name', 'Unknown')}입니다. (활동 수: {top_dev.get('activity_count', 0)})"
            else:
                return f"{result_count}명의 개발자 정보를 찾았습니다."
        
        elif query_type == QueryType.COUNT:
            total = sum(r.get("count", 0) for r in results)
            return f"총 {total}개의 항목이 있으며, {result_count}개 카테고리로 분류됩니다."
        
        elif query_type == QueryType.SKILL:
            if results:
                avg_proficiency = sum(r.get("proficiency", 0) for r in results) / len(results)
                return f"{result_count}개의 스킬을 찾았으며, 평균 숙련도는 {avg_proficiency:.1f}%입니다."
        
        return f"{result_count}개의 결과를 찾았습니다."
    
    def process_natural_query(self, natural_query: str) -> Dict[str, Any]:
        """자연어 질의 전체 처리 파이프라인"""
        logger.info(f"🎯 자연어 질의 처리 시작: '{natural_query}'")
        
        try:
            # 1. 질의 분석
            analysis = self.analyze_query(natural_query)
            
            # 2. Cypher 쿼리 생성
            cypher_query = self.generate_cypher_query(analysis)
            
            # 3. 쿼리 실행
            results = self.execute_query(cypher_query)
            
            # 4. 결과 포맷팅
            formatted_answer = self.format_answer(analysis, results)
            
            # 디버그 정보 추가
            formatted_answer["debug"] = {
                "generated_cypher": cypher_query,
                "raw_results_count": len(results)
            }
            
            logger.info(f"✅ 질의 처리 완료: {formatted_answer['success']}")
            return formatted_answer
            
        except Exception as e:
            logger.error(f"❌ 질의 처리 실패: {e}")
            return {
                "success": False,
                "message": f"질의 처리 중 오류가 발생했습니다: {str(e)}",
                "error": str(e),
                "timestamp": datetime.now().isoformat()
            }

def main():
    """테스트 및 예시 실행"""
    logger.info("🧠 고급 지식 추출 엔진 테스트 시작")
    
    engine = AdvancedKnowledgeEngine()
    
    try:
        if not engine.connect():
            return False
        
        # 테스트 질의들
        test_queries = [
            "가장 최근에 작업한 개발자는 누구인가?",
            "전체 개발자는 몇 명인가?",
            "Infrastructure Architect AI가 가진 스킬은 무엇인가?",
            "프로젝트 상태는 어떠한가?",
            "최근 성과는 무엇인가?",
            "Python 스킬을 가진 개발자는 누구인가?"
        ]
        
        logger.info(f"📋 {len(test_queries)}개 테스트 질의 실행")
        
        for i, query in enumerate(test_queries, 1):
            logger.info(f"\n--- 테스트 {i}: {query} ---")
            
            result = engine.process_natural_query(query)
            
            print(f"\n🔍 질의: {query}")
            print(f"✅ 성공: {result['success']}")
            print(f"📝 요약: {result['message']}")
            if result['success']:
                print(f"📊 결과 수: {result['result_count']}")
                print(f"🏷️ 질의 타입: {result['query_analysis']['type']}")
                if result['data']:
                    print(f"📄 첫 번째 결과: {result['data'][0]}")
        
        return True
        
    except Exception as e:
        logger.error(f"❌ 테스트 실패: {e}")
        return False
        
    finally:
        engine.close()

if __name__ == "__main__":
    success = main()
    print(f"\n{'✅ 테스트 성공!' if success else '❌ 테스트 실패!'}")