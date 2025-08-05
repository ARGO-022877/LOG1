#!/usr/bin/env python3
"""
현실 확인: Neo4j 연결이 실제로 되는지, 데이터가 정말 있는지 철저히 검증
"""

import os
import sys
from neo4j import GraphDatabase
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def reality_check():
    """현실 확인"""
    
    logger.info("🧠 현실 확인 시작 - 환각 여부 검증")
    logger.info("=" * 60)
    
    # 1. 환경변수 확인
    password = os.getenv('NEO4J_PASSWORD')
    logger.info(f"1️⃣ 환경변수 확인:")
    logger.info(f"  NEO4J_PASSWORD 존재: {password is not None}")
    if password:
        logger.info(f"  비밀번호 길이: {len(password)} 문자")
        logger.info(f"  비밀번호 시작: {password[:10]}...")
        logger.info(f"  비밀번호 끝: ...{password[-10:]}")
    else:
        logger.error("❌ 비밀번호가 없습니다!")
        return False
    
    # 2. 연결 시도
    instance_id = "3e875bd7"
    uri = f"neo4j+s://{instance_id}.databases.neo4j.io"
    
    logger.info(f"\n2️⃣ 연결 시도:")
    logger.info(f"  URI: {uri}")
    logger.info(f"  사용자명: neo4j")
    
    try:
        driver = GraphDatabase.driver(uri, auth=("neo4j", password))
        logger.info("  ✅ 드라이버 생성 성공")
        
        # 3. 실제 연결 테스트
        logger.info(f"\n3️⃣ 실제 연결 테스트:")
        with driver.session() as session:
            # 가장 기본적인 쿼리
            result = session.run("RETURN 1 as test")
            test_result = result.single()
            logger.info(f"  기본 쿼리 결과: {test_result['test']}")
            
            # 현재 시간 확인
            result = session.run("RETURN datetime() as now")
            now = result.single()['now']
            logger.info(f"  서버 시간: {now}")
            
            # 4. 데이터 존재 여부 확인
            logger.info(f"\n4️⃣ 데이터 존재 여부:")
            
            # 총 노드 수
            result = session.run("MATCH (n) RETURN count(n) as total")
            total_nodes = result.single()['total']
            logger.info(f"  총 노드 수: {total_nodes}")
            
            # 총 관계 수  
            result = session.run("MATCH ()-[r]->() RETURN count(r) as total")
            total_rels = result.single()['total']
            logger.info(f"  총 관계 수: {total_rels}")
            
            if total_nodes == 0:
                logger.info("  💭 데이터베이스가 완전히 비어있습니다!")
                logger.info("  🤔 이전 작업들이 실제로는 저장되지 않았을 수 있습니다.")
            else:
                logger.info(f"  📊 데이터가 {total_nodes}개 노드, {total_rels}개 관계 존재")
                
                # 어떤 노드들이 있는지 확인
                logger.info(f"\n5️⃣ 존재하는 노드 타입:")
                result = session.run("MATCH (n) RETURN DISTINCT labels(n) as labels, count(n) as count ORDER BY count DESC")
                for record in result:
                    logger.info(f"  {record['labels']}: {record['count']}개")
                
                # 샘플 노드 몇 개 확인
                logger.info(f"\n6️⃣ 샘플 노드들:")
                result = session.run("MATCH (n) RETURN labels(n)[0] as type, coalesce(n.name, n.id, n.title, 'unnamed') as name LIMIT 5")
                for record in result:
                    logger.info(f"  {record['type']}: {record['name']}")
            
            # 7. 스키마 확인
            logger.info(f"\n7️⃣ 데이터베이스 스키마:")
            try:
                result = session.run("CALL db.schema.visualization()")
                schema_info = result.data()
                logger.info(f"  스키마 정보 개수: {len(schema_info)}")
            except Exception as e:
                logger.info(f"  스키마 조회 실패: {e}")
            
            # 8. 제약조건 확인
            logger.info(f"\n8️⃣ 제약조건:")
            try:
                result = session.run("SHOW CONSTRAINTS")
                constraints = result.data()
                logger.info(f"  제약조건 개수: {len(constraints)}")
                for constraint in constraints[:3]:  # 처음 3개만
                    logger.info(f"  - {constraint.get('name', 'unnamed')}")
            except Exception as e:
                logger.info(f"  제약조건 조회 실패: {e}")
        
        driver.close()
        
        # 9. 최종 결론
        logger.info(f"\n" + "=" * 60)
        logger.info(f"🎯 현실 확인 결과:")
        logger.info(f"  ✅ 연결: 성공")
        logger.info(f"  📊 데이터: {total_nodes}개 노드, {total_rels}개 관계")
        
        if total_nodes == 0:
            logger.info(f"  🚨 결론: 데이터베이스가 비어있습니다!")
            logger.info(f"  💡 이전 작업들이 실제로는 실행되지 않았거나 다른 곳에 저장되었을 수 있습니다.")
            logger.info(f"  🔍 환각 가능성: 높음")
        else:
            logger.info(f"  ✅ 결론: 데이터가 실제로 존재합니다.")
            logger.info(f"  🔍 환각 가능성: 낮음")
        
        return True
        
    except Exception as e:
        logger.error(f"❌ 연결 실패: {e}")
        logger.error(f"🚨 결론: 연결 자체가 불가능합니다!")
        logger.error(f"🔍 환각 가능성: 매우 높음")
        return False

if __name__ == "__main__":
    reality_check()