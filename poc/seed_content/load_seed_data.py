#!/usr/bin/env python3
"""
마음로그 V4.0 - Neo4j Seed Content 로더
Phase 0: PoC - 지식 그래프 초기화 스크립트
"""

import os
import sys
from neo4j import GraphDatabase
import time
from pathlib import Path

class Neo4jSeedLoader:
    def __init__(self, uri="bolt://localhost:7687", user="neo4j", password="password"):
        """Neo4j 연결 초기화"""
        self.uri = uri
        self.user = user
        self.password = password
        self.driver = None
        
    def connect(self):
        """Neo4j 데이터베이스 연결"""
        try:
            print(f"🔌 Neo4j 연결 시도: {self.uri}")
            self.driver = GraphDatabase.driver(self.uri, auth=(self.user, self.password))
            
            # 연결 테스트
            with self.driver.session() as session:
                result = session.run("CALL db.ping()")
                print("✅ Neo4j 연결 성공!")
                return True
                
        except Exception as e:
            print(f"❌ Neo4j 연결 실패: {e}")
            print("\n💡 해결 방법:")
            print("1. Neo4j Desktop이 실행되고 있는지 확인")
            print("2. 데이터베이스가 시작되었는지 확인")
            print("3. 사용자명/비밀번호가 올바른지 확인")
            print("4. 포트 7687이 열려있는지 확인")
            return False
    
    def close(self):
        """연결 종료"""
        if self.driver:
            self.driver.close()
            print("🔌 Neo4j 연결 종료")
    
    def clear_database(self):
        """기존 데이터 초기화 (주의: 모든 데이터 삭제)"""
        print("🗑️  기존 데이터 정리 중...")
        with self.driver.session() as session:
            # 모든 노드와 관계 삭제
            session.run("MATCH (n) DETACH DELETE n")
            
            # 인덱스와 제약조건 삭제
            constraints = session.run("SHOW CONSTRAINTS").data()
            for constraint in constraints:
                constraint_name = constraint.get('name')
                if constraint_name:
                    try:
                        session.run(f"DROP CONSTRAINT {constraint_name}")
                    except:
                        pass
            
            indexes = session.run("SHOW INDEXES").data() 
            for index in indexes:
                index_name = index.get('name')
                if index_name and not index_name.startswith('system'):
                    try:
                        session.run(f"DROP INDEX {index_name}")
                    except:
                        pass
                        
        print("✅ 데이터베이스 정리 완료")
    
    def load_schema(self, schema_file):
        """스키마 파일 로드"""
        print(f"📋 스키마 로드 중: {schema_file}")
        
        if not os.path.exists(schema_file):
            print(f"❌ 스키마 파일을 찾을 수 없습니다: {schema_file}")
            return False
            
        with open(schema_file, 'r', encoding='utf-8') as f:
            schema_content = f.read()
        
        # 주석 제거 및 쿼리 분리
        queries = []
        current_query = []
        
        for line in schema_content.split('\n'):
            line = line.strip()
            # 주석 라인 건너뛰기
            if line.startswith('//') or line.startswith('#') or not line:
                continue
            
            current_query.append(line)
            
            # 세미콜론으로 끝나는 쿼리 완성
            if line.endswith(';'):
                query = ' '.join(current_query).replace(';', '')
                if query.strip():
                    queries.append(query.strip())
                current_query = []
        
        # 스키마 쿼리 실행
        successful_queries = 0
        with self.driver.session() as session:
            for i, query in enumerate(queries):
                try:
                    if query.upper().startswith(('CREATE CONSTRAINT', 'CREATE INDEX')):
                        session.run(query)
                        successful_queries += 1
                        print(f"  ✅ 스키마 쿼리 {i+1}/{len(queries)} 완료")
                except Exception as e:
                    print(f"  ⚠️  스키마 쿼리 {i+1} 건너뛰기 (이미 존재할 수 있음): {str(e)[:100]}")
        
        print(f"✅ 스키마 로드 완료: {successful_queries}/{len(queries)} 쿼리 성공")
        return True
    
    def load_seed_data(self, seed_file):
        """Seed 데이터 파일 로드"""
        print(f"🌱 Seed 데이터 로드 중: {seed_file}")
        
        if not os.path.exists(seed_file):
            print(f"❌ Seed 데이터 파일을 찾을 수 없습니다: {seed_file}")
            return False
            
        with open(seed_file, 'r', encoding='utf-8') as f:
            seed_content = f.read()
        
        # 주석 제거 및 쿼리 분리
        queries = []
        current_query = []
        in_multiline = False
        
        for line in seed_content.split('\n'):
            line = line.strip()
            
            # 주석 라인 건너뛰기
            if line.startswith('//') or line.startswith('#'):
                continue
            
            if not line:
                continue
                
            current_query.append(line)
            
            # 세미콜론으로 끝나는 쿼리 완성
            if line.endswith(';'):
                query = ' '.join(current_query).replace(';', '')
                if query.strip() and not query.upper().startswith(('CREATE CONSTRAINT', 'CREATE INDEX')):
                    queries.append(query.strip())
                current_query = []
        
        # Seed 데이터 쿼리 실행
        successful_queries = 0
        failed_queries = 0
        
        with self.driver.session() as session:
            for i, query in enumerate(queries):
                try:
                    result = session.run(query)
                    summary = result.consume()
                    
                    # 결과 통계
                    nodes_created = summary.counters.nodes_created
                    relationships_created = summary.counters.relationships_created
                    
                    if nodes_created > 0 or relationships_created > 0:
                        print(f"  ✅ 쿼리 {i+1}/{len(queries)}: 노드 +{nodes_created}, 관계 +{relationships_created}")
                    
                    successful_queries += 1
                    
                except Exception as e:
                    failed_queries += 1
                    print(f"  ❌ 쿼리 {i+1} 실패: {str(e)[:100]}")
                    print(f"     Query: {query[:100]}...")
        
        print(f"✅ Seed 데이터 로드 완료: {successful_queries}/{len(queries)} 쿼리 성공, {failed_queries} 실패")
        return True
    
    def verify_data(self):
        """데이터 로드 검증"""
        print("🔍 데이터 검증 중...")
        
        verification_queries = [
            "MATCH (n) RETURN labels(n)[0] as NodeType, count(n) as Count ORDER BY Count DESC",
            "MATCH ()-[r]->() RETURN type(r) as RelationType, count(r) as Count ORDER BY Count DESC LIMIT 10",
            "MATCH (d:Developer) RETURN d.name, d.type, d.specialization LIMIT 5",
            "MATCH (p:Project) RETURN p.name, p.status, p.currentPhase LIMIT 5",
            "MATCH (c:Commit) RETURN c.hash, c.message, c.author LIMIT 5"
        ]
        
        with self.driver.session() as session:
            for i, query in enumerate(verification_queries):
                try:
                    result = session.run(query)
                    records = result.data()
                    
                    if i == 0:
                        print("\n📊 노드 타입별 개수:")
                        for record in records:
                            print(f"  {record['NodeType']}: {record['Count']}개")
                    elif i == 1:
                        print("\n🔗 관계 타입별 개수 (상위 10개):")
                        for record in records:
                            print(f"  {record['RelationType']}: {record['Count']}개")
                    elif i == 2:
                        print("\n👥 개발자 샘플 (5명):")
                        for record in records:
                            print(f"  {record['d.name']} ({record['d.type']}) - {record['d.specialization']}")
                    elif i == 3:
                        print("\n🏗️ 프로젝트 샘플:")
                        for record in records:
                            print(f"  {record['p.name']} - {record['p.status']} ({record['p.currentPhase']})")
                    elif i == 4:
                        print("\n💾 커밋 샘플:")
                        for record in records:
                            print(f"  {record['c.hash'][:8]} - {record['c.message'][:50]}... (by {record['c.author']})")
                            
                except Exception as e:
                    print(f"  ❌ 검증 쿼리 {i+1} 실패: {e}")
        
        print("\n✅ 데이터 검증 완료!")

def main():
    """메인 실행 함수"""
    print("🚀 마음로그 V4.0 - Neo4j Seed Content 로더 시작")
    print("=" * 60)
    
    # 파일 경로 설정
    base_dir = Path(__file__).parent.parent
    schema_file = base_dir / "knowledge_schema" / "schema.cypher"
    seed_file = base_dir / "seed_content" / "seed_data_generation.cypher"
    
    print(f"📂 스키마 파일: {schema_file}")
    print(f"📂 Seed 파일: {seed_file}")
    print()
    
    # Neo4j 연결 설정 (필요시 수정)
    loader = Neo4jSeedLoader(
        uri="bolt://localhost:7687",
        user="neo4j", 
        password="password"  # 실제 비밀번호로 변경 필요
    )
    
    try:
        # 1. 연결
        if not loader.connect():
            return False
        
        # 2. 기존 데이터 정리 (선택사항)
        response = input("\n⚠️  기존 데이터를 모두 삭제하고 새로 시작하시겠습니까? (y/N): ")
        if response.lower() in ['y', 'yes']:
            loader.clear_database()
        
        # 3. 스키마 로드
        print("\n" + "="*60)
        if not loader.load_schema(schema_file):
            return False
        
        # 4. Seed 데이터 로드
        print("\n" + "="*60)
        if not loader.load_seed_data(seed_file):
            return False
        
        # 5. 데이터 검증
        print("\n" + "="*60)
        loader.verify_data()
        
        print("\n🎉 Neo4j Seed Content 로드 성공!")
        print("💡 Neo4j Browser에서 다음 쿼리로 확인할 수 있습니다:")
        print("   MATCH (n) RETURN n LIMIT 25")
        
        return True
        
    except KeyboardInterrupt:
        print("\n⏹️  사용자에 의해 중단되었습니다.")
        return False
        
    except Exception as e:
        print(f"\n❌ 예상치 못한 오류: {e}")
        return False
        
    finally:
        loader.close()

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)