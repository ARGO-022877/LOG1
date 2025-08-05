#!/usr/bin/env python3
"""간단한 테스트"""

from advanced_knowledge_engine import AdvancedKnowledgeEngine

engine = AdvancedKnowledgeEngine()

if engine.connect():
    print("🔍 Python 스킬을 가진 개발자 테스트:")
    result = engine.process_natural_query("Python 스킬을 가진 개발자는 누구인가?")
    print(f"성공: {result['success']}")
    if result['success']:
        print(f"결과: {result['data']}")
        print(f"생성된 쿼리: {result.get('debug', {}).get('generated_cypher', 'N/A')}")
    else:
        print(f"오류: {result.get('error', 'Unknown')}")
    
    print("\n🔍 개발자 수 테스트:")
    result = engine.process_natural_query("전체 개발자는 몇 명인가?")
    print(f"성공: {result['success']}")
    if result['success']:
        print(f"결과: {result['data']}")
    
    engine.close()
else:
    print("연결 실패")