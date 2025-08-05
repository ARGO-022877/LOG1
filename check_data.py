#!/usr/bin/env python3
"""데이터 확인 스크립트"""

import os
from neo4j import GraphDatabase

instance_id = "3e875bd7"
uri = f"neo4j+s://{instance_id}.databases.neo4j.io"
username = "neo4j"
password = os.getenv('NEO4J_PASSWORD')

driver = GraphDatabase.driver(uri, auth=(username, password))

with driver.session() as session:
    print('=== 개발자별 스킬 확인 ===')
    result = session.run('MATCH (dev:Developer)-[r:HAS_SKILL]->(skill:Skill) RETURN dev.name, skill.name, r.proficiency ORDER BY dev.name, r.proficiency DESC')
    for record in result:
        print(f'{record["dev.name"]}: {record["skill.name"]} ({record["r.proficiency"]}%)')
    
    print('\n=== Python 스킬 확인 ===')
    result = session.run('MATCH (skill:Skill) WHERE skill.name CONTAINS "Python" RETURN skill.name')
    for record in result:
        print(f'스킬: {record["skill.name"]}')
    
    print('\n=== 모든 스킬 목록 ===')
    result = session.run('MATCH (skill:Skill) RETURN skill.name ORDER BY skill.name')
    for record in result:
        print(f'- {record["skill.name"]}')

driver.close()