#!/usr/bin/env python3
"""
Neo4j 연결 및 데이터베이스 상태 정확한 검증
"""

import os
from neo4j import GraphDatabase
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def verify_connection():
    """Neo4j 연결 및 상태 정확히 검증"""
    
    instance_id = "3e875bd7"
    uri = f"neo4j+s://{instance_id}.databases.neo4j.io"
    username = "neo4j"
    password = os.getenv('NEO4J_PASSWORD')
    
    if not password:
        logger.error("❌ NEO4J_PASSWORD 환경변수가 설정되지 않았습니다.")
        return False
    
    logger.info(f"🔍 연결 검증 시작:")
    logger.info(f"  URI: {uri}")
    logger.info(f"  인스턴스 ID: {instance_id}")
    logger.info(f"  사용자명: {username}")
    logger.info(f"  비밀번호 길이: {len(password)} 문자")
    
    try:
        driver = GraphDatabase.driver(uri, auth=(username, password))
        
        with driver.session() as session:
            # 1. 기본 연결 테스트
            logger.info("\n1️⃣ 기본 연결 테스트:")
            result = session.run("RETURN 'Connection Test' as test, datetime() as timestamp")
            record = result.single()
            logger.info(f"  ✅ 연결 성공: {record['test']}")
            logger.info(f"  ⏰ 서버 시간: {record['timestamp']}")
            
            # 2. 데이터베이스 정보 확인
            logger.info("\n2️⃣ 데이터베이스 정보:")
            result = session.run("CALL db.info()")
            info = result.single()
            if info:
                logger.info(f"  데이터베이스 ID: {info.get('id', 'N/A')}")
                logger.info(f"  데이터베이스 이름: {info.get('name', 'N/A')}")
                logger.info(f"  버전: {info.get('edition', 'N/A')}")
            
            # 3. 전체 노드 및 관계 개수 확인
            logger.info("\n3️⃣ 데이터 현황:")
            result = session.run("MATCH (n) RETURN count(n) as total_nodes")
            total_nodes = result.single()['total_nodes']
            
            result = session.run("MATCH ()-[r]->() RETURN count(r) as total_relationships")
            total_relationships = result.single()['total_relationships']
            
            logger.info(f"  총 노드 수: {total_nodes}")
            logger.info(f"  총 관계 수: {total_relationships}")
            
            # 4. 노드 타입별 분포
            if total_nodes > 0:
                logger.info("\n4️⃣ 노드 타입별 분포:")
                result = session.run("MATCH (n) RETURN labels(n) as labels, count(n) as count ORDER BY count DESC")
                for record in result:
                    labels = record['labels']
                    count = record['count']
                    if labels:
                        logger.info(f"  {labels}: {count}개")
                    else:
                        logger.info(f"  [빈 라벨]: {count}개")
                
                # 5. 관계 타입별 분포
                logger.info("\n5️⃣ 관계 타입별 분포:")
                result = session.run("MATCH ()-[r]->() RETURN type(r) as rel_type, count(r) as count ORDER BY count DESC LIMIT 10")
                for record in result:
                    logger.info(f"  {record['rel_type']}: {record['count']}개")
            
            else:
                logger.info("  📭 데이터베이스가 비어있습니다!")
            
            # 6. 최근 생성된 노드 확인 (있다면)
            if total_nodes > 0:
                logger.info("\n6️⃣ 최근 생성된 노드 (상위 5개):")
                result = session.run("""
                    MATCH (n) 
                    WHERE n.created IS NOT NULL OR n.timestamp IS NOT NULL
                    RETURN labels(n)[0] as node_type, 
                           coalesce(n.name, n.id, n.title, 'Unknown') as identifier,
                           coalesce(n.created, n.timestamp) as created_time
                    ORDER BY created_time DESC 
                    LIMIT 5
                """)
                
                found_recent = False
                for record in result:
                    if not found_recent:
                        found_recent = True
                    logger.info(f"  {record['node_type']}: {record['identifier']} ({record['created_time']})")
                
                if not found_recent:
                    logger.info("  시간 정보가 있는 노드가 없습니다.")
        
        driver.close()
        
        logger.info(f"\n🎯 결론:")
        if total_nodes == 0:
            logger.info(f"  ❌ 인스턴스 {instance_id}는 현재 완전히 비어있습니다!")
            logger.info(f"  💡 이전에 생성했다고 생각한 데이터가 실제로는 저장되지 않았을 수 있습니다.")
        else:
            logger.info(f"  ✅ 인스턴스 {instance_id}에 {total_nodes}개 노드, {total_relationships}개 관계가 있습니다.")
            logger.info(f"  🔍 사용자가 보고 있는 화면과 다를 수 있습니다.")
        
        return True
        
    except Exception as e:
        logger.error(f"❌ 연결 실패: {e}")
        return False

if __name__ == "__main__":
    verify_connection()