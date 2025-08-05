#!/usr/bin/env python3
"""간단한 API 테스트"""

import os
from advanced_knowledge_engine import AdvancedKnowledgeEngine

# 환경변수 직접 설정
import subprocess
try:
    password = subprocess.check_output([
        'gcloud', 'secrets', 'versions', 'access', 'latest', 
        '--secret=maeum-log-v4-neo4j-auradb-api'
    ], text=True).strip()
    os.environ['NEO4J_PASSWORD'] = password
    print(f"✅ 패스워드 설정 완료")
except Exception as e:
    print(f"❌ 패스워드 설정 실패: {e}")

# 엔진 테스트
print("\n🔬 엔진 기능 테스트")
engine = AdvancedKnowledgeEngine()

if engine.connect():
    print("✅ 엔진 연결 성공")
    
    # 간단한 질의 테스트
    result = engine.process_natural_query("Python 스킬을 가진 개발자는 누구인가?")
    print(f"✅ 질의 성공: {result['success']}")
    if result['success']:
        print(f"📊 결과: {result['data']}")
    
    engine.close()
else:
    print("❌ 엔진 연결 실패")

print("\n🎉 기본 기능 검증 완료!")