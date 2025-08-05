#!/usr/bin/env python3
"""
고급 지식 추출 엔진 통합 테스트
API와 엔진의 전체 기능을 검증
"""

import time
import threading
import requests
from advanced_knowledge_engine import AdvancedKnowledgeEngine
from knowledge_api import app
import json

def test_engine_directly():
    """엔진 직접 테스트"""
    print("🔬 고급 지식 엔진 직접 테스트")
    print("=" * 50)
    
    engine = AdvancedKnowledgeEngine()
    
    if not engine.connect():
        print("❌ 엔진 연결 실패")
        return False
    
    test_queries = [
        "Python 스킬을 가진 개발자는 누구인가?",
        "전체 개발자는 몇 명인가?",
        "Infrastructure Architect AI가 가진 스킬은 무엇인가?",
        "프로젝트 상태는 어떠한가?"
    ]
    
    success_count = 0
    
    for i, query in enumerate(test_queries, 1):
        print(f"\n{i}. 질의: {query}")
        
        result = engine.process_natural_query(query)
        
        if result['success']:
            print(f"   ✅ 성공: {result['message']}")
            print(f"   📊 결과 수: {result['result_count']}")
            success_count += 1
        else:
            print(f"   ❌ 실패: {result.get('error', 'Unknown')}")
    
    engine.close()
    
    success_rate = (success_count / len(test_queries)) * 100
    print(f"\n📈 직접 테스트 결과: {success_count}/{len(test_queries)} ({success_rate:.1f}%)")
    
    return success_rate >= 75

def test_api_server():
    """API 서버 테스트"""
    print("\n🌐 API 서버 테스트")
    print("=" * 50)
    
    # API 서버를 별도 스레드에서 실행
    server_thread = threading.Thread(
        target=lambda: app.run(host='0.0.0.0', port=5001, debug=False),
        daemon=True
    )
    server_thread.start()
    
    # 서버 시작 대기
    print("⏳ API 서버 시작 대기...")
    time.sleep(5)
    
    base_url = "http://localhost:5001"
    
    try:
        # 1. Health Check
        print("\n1. Health Check 테스트")
        response = requests.get(f"{base_url}/api/v1/health", timeout=10)
        if response.status_code == 200:
            health = response.json()
            print(f"   ✅ 서버 상태: {health['status']}")
        else:
            print(f"   ❌ Health Check 실패: {response.status_code}")
            return False
        
        # 2. 단일 질의 테스트
        print("\n2. 단일 질의 테스트")
        query_data = {"query": "Python 스킬을 가진 개발자는 누구인가?"}
        response = requests.post(
            f"{base_url}/api/v1/query",
            json=query_data,
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        
        if response.status_code == 200:
            result = response.json()
            if result['success']:
                print(f"   ✅ 질의 성공: {result['message']}")
                print(f"   📊 결과 수: {result['result_count']}")
            else:
                print(f"   ❌ 질의 실패: {result.get('error', 'Unknown')}")
                return False
        else:
            print(f"   ❌ API 호출 실패: {response.status_code}")
            return False
        
        # 3. 배치 질의 테스트
        print("\n3. 배치 질의 테스트")
        batch_data = {
            "queries": [
                "전체 개발자는 몇 명인가?",
                "프로젝트 상태는 어떠한가?"
            ]
        }
        response = requests.post(
            f"{base_url}/api/v1/query/batch",
            json=batch_data,
            headers={"Content-Type": "application/json"},
            timeout=15
        )
        
        if response.status_code == 200:
            result = response.json()
            if result['success']:
                summary = result['batch_summary']
                print(f"   ✅ 배치 성공: {summary['successful']}/{summary['total_queries']}")
                print(f"   📈 성공률: {summary['success_rate']}%")
            else:
                print(f"   ❌ 배치 실패: {result.get('error', 'Unknown')}")
                return False
        else:
            print(f"   ❌ 배치 API 호출 실패: {response.status_code}")
            return False
        
        # 4. 스키마 정보 테스트
        print("\n4. 스키마 정보 테스트")
        response = requests.get(f"{base_url}/api/v1/schema", timeout=10)
        if response.status_code == 200:
            schema = response.json()
            if schema['success']:
                data = schema['data']
                print(f"   ✅ 스키마 로드 성공")
                print(f"   📋 노드 타입: {len(data['node_labels'])}개")
                print(f"   🔗 관계 타입: {len(data['relationship_types'])}개")
            else:
                print(f"   ❌ 스키마 로드 실패")
                return False
        else:
            print(f"   ❌ 스키마 API 호출 실패: {response.status_code}")
            return False
        
        print("\n🎉 API 서버 테스트 완료!")
        return True
        
    except requests.RequestException as e:
        print(f"❌ API 테스트 중 네트워크 오류: {e}")
        return False

def main():
    """메인 통합 테스트"""
    print("🚀 고급 지식 추출 엔진 통합 테스트 시작")
    print("=" * 60)
    
    # 1. 엔진 직접 테스트
    engine_success = test_engine_directly()
    
    # 2. API 서버 테스트
    api_success = test_api_server()
    
    # 최종 결과
    print("\n" + "=" * 60)
    print("📊 통합 테스트 최종 결과")
    print("=" * 60)
    print(f"🔬 엔진 직접 테스트: {'✅ 성공' if engine_success else '❌ 실패'}")
    print(f"🌐 API 서버 테스트: {'✅ 성공' if api_success else '❌ 실패'}")
    
    overall_success = engine_success and api_success
    print(f"\n🎯 전체 결과: {'✅ 성공' if overall_success else '❌ 실패'}")
    
    if overall_success:
        print("\n🏆 고급 지식 추출 엔진이 완전히 구축되었습니다!")
        print("📋 애플리케이션 개발자 AI가 사용할 준비가 완료되었습니다.")
    else:
        print("\n⚠️ 일부 테스트가 실패했습니다. 문제를 확인해주세요.")
    
    return overall_success

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)