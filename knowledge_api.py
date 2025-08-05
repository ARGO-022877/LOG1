#!/usr/bin/env python3
"""
지식 추출 엔진 API 서버
애플리케이션 개발자 AI가 사용할 수 있는 RESTful API 제공

엔드포인트:
- POST /api/v1/query - 자연어 질의 처리
- GET /api/v1/schema - 데이터베이스 스키마 정보
- GET /api/v1/health - 서비스 상태 확인
- GET /api/v1/stats - 사용 통계
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import logging
from datetime import datetime
from advanced_knowledge_engine import AdvancedKnowledgeEngine
import json

# 로깅 설정
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Flask 앱 설정
app = Flask(__name__)
CORS(app)  # CORS 허용

# 글로벌 지식 엔진 인스턴스
knowledge_engine = None

# API 사용 통계
api_stats = {
    "total_queries": 0,
    "successful_queries": 0,
    "failed_queries": 0,
    "start_time": datetime.now().isoformat(),
    "query_types": {},
    "recent_queries": []
}

def init_knowledge_engine():
    """지식 엔진 초기화"""
    global knowledge_engine
    try:
        knowledge_engine = AdvancedKnowledgeEngine()
        if knowledge_engine.connect():
            logger.info("✅ 지식 엔진 초기화 성공")
            return True
        else:
            logger.error("❌ 지식 엔진 연결 실패")
            return False
    except Exception as e:
        logger.error(f"❌ 지식 엔진 초기화 실패: {e}")
        return False

def update_stats(query_type: str, success: bool, query: str):
    """API 사용 통계 업데이트"""
    global api_stats
    
    api_stats["total_queries"] += 1
    if success:
        api_stats["successful_queries"] += 1
    else:
        api_stats["failed_queries"] += 1
    
    # 질의 타입별 통계
    if query_type not in api_stats["query_types"]:
        api_stats["query_types"][query_type] = 0
    api_stats["query_types"][query_type] += 1
    
    # 최근 질의 기록 (최대 10개)
    api_stats["recent_queries"].append({
        "query": query[:100],  # 길이 제한
        "timestamp": datetime.now().isoformat(),
        "success": success,
        "type": query_type
    })
    
    if len(api_stats["recent_queries"]) > 10:
        api_stats["recent_queries"].pop(0)

@app.route('/api/v1/health', methods=['GET'])
def health_check():
    """서비스 상태 확인"""
    try:
        # 지식 엔진 연결 상태 확인
        engine_status = "connected" if knowledge_engine and knowledge_engine.driver else "disconnected"
        
        # 간단한 DB 테스트
        if knowledge_engine and knowledge_engine.driver:
            try:
                with knowledge_engine.driver.session() as session:
                    result = session.run("RETURN 1 as test")
                    test_result = result.single()["test"]
                    db_status = "healthy" if test_result == 1 else "unhealthy"
            except:
                db_status = "unhealthy"
        else:
            db_status = "disconnected"
        
        return jsonify({
            "status": "healthy" if engine_status == "connected" and db_status == "healthy" else "unhealthy",
            "timestamp": datetime.now().isoformat(),
            "components": {
                "knowledge_engine": engine_status,
                "auradb_connection": db_status
            },
            "version": "1.0.0"
        })
        
    except Exception as e:
        return jsonify({
            "status": "unhealthy",
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }), 500

@app.route('/api/v1/schema', methods=['GET'])
def get_schema():
    """데이터베이스 스키마 정보"""
    try:
        if not knowledge_engine:
            return jsonify({"error": "지식 엔진이 초기화되지 않았습니다"}), 500
        
        schema_info = {
            "node_labels": knowledge_engine.node_labels,
            "relationship_types": knowledge_engine.relationship_types,
            "node_properties": knowledge_engine.node_properties,
            "schema_cached_at": datetime.now().isoformat()
        }
        
        return jsonify({
            "success": True,
            "data": schema_info,
            "timestamp": datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"❌ 스키마 조회 실패: {e}")
        return jsonify({
            "success": False,
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }), 500

@app.route('/api/v1/stats', methods=['GET'])
def get_stats():
    """API 사용 통계"""
    try:
        # 성공률 계산
        total = api_stats["total_queries"]
        success_rate = (api_stats["successful_queries"] / total * 100) if total > 0 else 0
        
        stats_response = {
            **api_stats,
            "success_rate": round(success_rate, 2),
            "uptime_seconds": (datetime.now() - datetime.fromisoformat(api_stats["start_time"])).total_seconds()
        }
        
        return jsonify({
            "success": True,
            "data": stats_response,
            "timestamp": datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"❌ 통계 조회 실패: {e}")
        return jsonify({
            "success": False,
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }), 500

@app.route('/api/v1/query', methods=['POST'])
def process_query():
    """자연어 질의 처리"""
    try:
        # 요청 데이터 검증
        data = request.get_json()
        if not data or 'query' not in data:
            return jsonify({
                "success": False,
                "error": "질의 텍스트가 필요합니다. {'query': '질문 내용'}",
                "timestamp": datetime.now().isoformat()
            }), 400
        
        natural_query = data['query'].strip()
        if not natural_query:
            return jsonify({
                "success": False,
                "error": "빈 질의는 처리할 수 없습니다",
                "timestamp": datetime.now().isoformat()
            }), 400
        
        logger.info(f"📨 API 질의 수신: '{natural_query}'")
        
        # 지식 엔진 상태 확인
        if not knowledge_engine:
            return jsonify({
                "success": False,
                "error": "지식 엔진이 초기화되지 않았습니다",
                "timestamp": datetime.now().isoformat()
            }), 500
        
        # 질의 처리
        result = knowledge_engine.process_natural_query(natural_query)
        
        # 통계 업데이트
        query_type = result.get('query_analysis', {}).get('type', 'unknown')
        update_stats(query_type, result['success'], natural_query)
        
        # 추가 메타데이터
        result["api_version"] = "1.0.0"
        result["processing_timestamp"] = datetime.now().isoformat()
        
        logger.info(f"✅ API 질의 처리 완료: {result['success']}")
        
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"❌ API 질의 처리 실패: {e}")
        
        # 통계 업데이트 (실패)
        update_stats('error', False, request.get_json().get('query', 'unknown') if request.get_json() else 'unknown')
        
        return jsonify({
            "success": False,
            "error": f"서버 오류: {str(e)}",
            "timestamp": datetime.now().isoformat()
        }), 500

@app.route('/api/v1/query/batch', methods=['POST'])
def process_batch_queries():
    """배치 질의 처리 (여러 질문 동시 처리)"""
    try:
        data = request.get_json()
        if not data or 'queries' not in data:
            return jsonify({
                "success": False,
                "error": "질의 배열이 필요합니다. {'queries': ['질문1', '질문2']}",
                "timestamp": datetime.now().isoformat()
            }), 400
        
        queries = data['queries']
        if not isinstance(queries, list) or len(queries) == 0:
            return jsonify({
                "success": False,
                "error": "최소 1개 이상의 질의가 필요합니다",
                "timestamp": datetime.now().isoformat()
            }), 400
        
        if len(queries) > 10:
            return jsonify({
                "success": False,
                "error": "배치당 최대 10개 질의까지 처리 가능합니다",
                "timestamp": datetime.now().isoformat()
            }), 400
        
        logger.info(f"📨 배치 질의 수신: {len(queries)}개")
        
        results = []
        for i, query in enumerate(queries):
            try:
                result = knowledge_engine.process_natural_query(query.strip())
                result["batch_index"] = i
                results.append(result)
                
                # 개별 통계 업데이트
                query_type = result.get('query_analysis', {}).get('type', 'unknown')
                update_stats(query_type, result['success'], query)
                
            except Exception as e:
                error_result = {
                    "success": False,
                    "error": f"질의 {i+1} 처리 실패: {str(e)}",
                    "batch_index": i,
                    "timestamp": datetime.now().isoformat()
                }
                results.append(error_result)
                update_stats('error', False, query)
        
        # 배치 결과 요약
        successful_count = sum(1 for r in results if r['success'])
        
        return jsonify({
            "success": True,
            "batch_summary": {
                "total_queries": len(queries),
                "successful": successful_count,
                "failed": len(queries) - successful_count,
                "success_rate": round(successful_count / len(queries) * 100, 2)
            },
            "results": results,
            "timestamp": datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"❌ 배치 질의 처리 실패: {e}")
        return jsonify({
            "success": False,
            "error": f"배치 처리 오류: {str(e)}",
            "timestamp": datetime.now().isoformat()
        }), 500

@app.route('/api/v1/examples', methods=['GET'])
def get_examples():
    """사용 예시 제공"""
    examples = {
        "basic_queries": [
            {
                "question": "가장 최근에 작업한 개발자는 누구인가?",
                "type": "WHO",
                "description": "최근 활동한 개발자 조회"
            },
            {
                "question": "전체 개발자는 몇 명인가?",
                "type": "COUNT",
                "description": "개발자 수 통계"
            },
            {
                "question": "Infrastructure Architect AI가 가진 스킬은 무엇인가?",
                "type": "SKILL",
                "description": "특정 개발자의 스킬 조회"
            },
            {
                "question": "프로젝트 상태는 어떠한가?",
                "type": "WHAT",
                "description": "프로젝트 현황 조회"
            }
        ],
        "api_usage": {
            "single_query": {
                "url": "/api/v1/query",
                "method": "POST",
                "body": {
                    "query": "가장 최근에 작업한 개발자는 누구인가?"
                }
            },
            "batch_query": {
                "url": "/api/v1/query/batch",
                "method": "POST",
                "body": {
                    "queries": [
                        "개발자는 몇 명인가?",
                        "프로젝트 상태는 어떠한가?"
                    ]
                }
            }
        },
        "response_format": {
            "success": True,
            "message": "요약 메시지",
            "data": ["결과 데이터 배열"],
            "result_count": 1,
            "query_analysis": {
                "original_query": "원본 질문",
                "type": "질의 타입",
                "complexity": "복잡도",
                "intent": "의도 분석"
            }
        }
    }
    
    return jsonify({
        "success": True,
        "examples": examples,
        "timestamp": datetime.now().isoformat()
    })

@app.errorhandler(404)
def not_found(error):
    """404 오류 처리"""
    return jsonify({
        "success": False,
        "error": "API 엔드포인트를 찾을 수 없습니다",
        "available_endpoints": [
            "POST /api/v1/query",
            "POST /api/v1/query/batch",
            "GET /api/v1/schema",
            "GET /api/v1/health",
            "GET /api/v1/stats",
            "GET /api/v1/examples"
        ],
        "timestamp": datetime.now().isoformat()
    }), 404

@app.errorhandler(500)
def internal_error(error):
    """500 오류 처리"""
    return jsonify({
        "success": False,
        "error": "내부 서버 오류가 발생했습니다",
        "timestamp": datetime.now().isoformat()
    }), 500

if __name__ == '__main__':
    logger.info("🚀 지식 추출 엔진 API 서버 시작")
    
    # 지식 엔진 초기화
    if not init_knowledge_engine():
        logger.error("❌ 지식 엔진 초기화 실패, 서버 종료")
        exit(1)
    
    logger.info("✅ 지식 엔진 API 서버 준비 완료")
    logger.info("📋 사용 가능한 엔드포인트:")
    logger.info("  - POST /api/v1/query - 자연어 질의 처리")
    logger.info("  - POST /api/v1/query/batch - 배치 질의 처리")
    logger.info("  - GET /api/v1/schema - 스키마 정보")
    logger.info("  - GET /api/v1/health - 서비스 상태")
    logger.info("  - GET /api/v1/stats - 사용 통계")
    logger.info("  - GET /api/v1/examples - 사용 예시")
    
    # 개발 서버 실행 (프로덕션에서는 WSGI 서버 사용 권장)
    app.run(
        host='0.0.0.0',
        port=int(os.getenv('PORT', 5000)),
        debug=os.getenv('FLASK_DEBUG', 'False').lower() == 'true'
    )