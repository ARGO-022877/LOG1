#!/usr/bin/env python3
"""
Neo4j AuraDB Brain Connector for 마음로그 V4.0
This script connects to Neo4j AuraDB Professional using T1 verified secure patterns
"""

import os
import sys
import json
from google.cloud import secretmanager
from google.auth import default
import logging
from neo4j import GraphDatabase
import time

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class AuraDBBrainConnector:
    def __init__(self, project_id: str):
        """
        Initialize AuraDB Brain Connector with secure credential retrieval.
        Uses T1 Risk Verification proven pattern for safe state transfer.
        """
        self.project_id = project_id
        self.client = secretmanager.SecretManagerServiceClient()
        self.driver = None
        self.connection_info = None
        
    def get_auradb_credentials(self) -> dict:
        """
        Retrieve Neo4j AuraDB credentials from GCP Secret Manager.
        Implements T1 verified secure state transfer pattern.
        """
        try:
            # Get API key
            api_secret_name = f"projects/{self.project_id}/secrets/maeum-log-v4-neo4j-auradb-api/versions/latest"
            api_response = self.client.access_secret_version(request={"name": api_secret_name})
            api_key = api_response.payload.data.decode("UTF-8")
            
            # Get connection info
            info_secret_name = f"projects/{self.project_id}/secrets/maeum-log-v4-neo4j-connection-info/versions/latest"
            info_response = self.client.access_secret_version(request={"name": info_secret_name})
            connection_info = json.loads(info_response.payload.data.decode("UTF-8"))
            
            logger.info("Successfully retrieved AuraDB credentials from Secret Manager")
            logger.info(f"AuraDB Instance: {connection_info['instance_id']} ({connection_info['type']})")
            
            self.connection_info = connection_info
            
            return {
                "api_key": api_key,
                "connection_info": connection_info
            }
            
        except Exception as e:
            logger.error(f"Failed to retrieve AuraDB credentials: {str(e)}")
            raise

    def connect_to_auradb_brain(self) -> bool:
        """
        Establish secure connection to Neo4j AuraDB Brain database.
        """
        try:
            credentials = self.get_auradb_credentials()
            
            # AuraDB connection URI format: neo4j+s://instance_id.databases.neo4j.io
            auradb_uri = f"neo4j+s://{credentials['connection_info']['instance_id']}.databases.neo4j.io"
            
            # For AuraDB, we typically use 'neo4j' as username and the API key as password
            self.driver = GraphDatabase.driver(
                auradb_uri,
                auth=("neo4j", credentials["api_key"])
            )
            
            # Test connection
            with self.driver.session() as session:
                result = session.run("RETURN '마음로그 V4.0 Brain Connection Successful!' as message")
                message = result.single()["message"]
                logger.info(f"Neo4j AuraDB Brain connection test: {message}")
                
            return True
            
        except Exception as e:
            logger.error(f"Failed to connect to Neo4j AuraDB Brain: {str(e)}")
            return False

    def initialize_brain_schema(self) -> bool:
        """
        Initialize the brain database with 마음로그 V4.0 schema.
        """
        try:
            with self.driver.session() as session:
                logger.info("Initializing 마음로그 V4.0 Brain Schema...")
                
                # Create constraints and indexes
                schema_commands = [
                    # Developer nodes
                    "CREATE CONSTRAINT developer_id_unique IF NOT EXISTS FOR (d:Developer) REQUIRE d.id IS UNIQUE",
                    "CREATE INDEX developer_name_index IF NOT EXISTS FOR (d:Developer) ON (d.name)",
                    
                    # Project nodes
                    "CREATE CONSTRAINT project_id_unique IF NOT EXISTS FOR (p:Project) REQUIRE p.id IS UNIQUE",
                    "CREATE INDEX project_name_index IF NOT EXISTS FOR (p:Project) ON (p.name)",
                    
                    # Commit nodes
                    "CREATE CONSTRAINT commit_hash_unique IF NOT EXISTS FOR (c:Commit) REQUIRE c.hash IS UNIQUE", 
                    "CREATE INDEX commit_timestamp_index IF NOT EXISTS FOR (c:Commit) ON (c.timestamp)",
                    
                    # File nodes
                    "CREATE CONSTRAINT file_path_unique IF NOT EXISTS FOR (f:File) REQUIRE f.path IS UNIQUE",
                    "CREATE INDEX file_type_index IF NOT EXISTS FOR (f:File) ON (f.extension)",
                    
                    # Function nodes
                    "CREATE CONSTRAINT function_signature_unique IF NOT EXISTS FOR (fn:Function) REQUIRE fn.signature IS UNIQUE",
                    "CREATE INDEX function_name_index IF NOT EXISTS FOR (fn:Function) ON (fn.name)",
                    
                    # Concept nodes
                    "CREATE CONSTRAINT concept_id_unique IF NOT EXISTS FOR (con:Concept) REQUIRE con.id IS UNIQUE",
                    "CREATE INDEX concept_name_index IF NOT EXISTS FOR (con:Concept) ON (con.name)",
                    
                    # Skill nodes
                    "CREATE CONSTRAINT skill_id_unique IF NOT EXISTS FOR (sk:Skill) REQUIRE sk.id IS UNIQUE",
                    "CREATE INDEX skill_category_index IF NOT EXISTS FOR (sk:Skill) ON (sk.category)",
                    
                    # Session nodes
                    "CREATE CONSTRAINT session_id_unique IF NOT EXISTS FOR (s:Session) REQUIRE s.id IS UNIQUE",
                    "CREATE INDEX session_date_index IF NOT EXISTS FOR (s:Session) ON (s.startTime)"
                ]
                
                for command in schema_commands:
                    session.run(command)
                    logger.info(f"Executed: {command}")
                
                # Create initial project and brain system nodes
                session.run("""
                    MERGE (p:Project {id: "maumlog-v4"})
                    SET p.name = "마음로그 V4.0",
                        p.description = "AI 전문가 조립 라인 기반 자율 개발 생태계",
                        p.created = datetime(),
                        p.phase = "PoC",
                        p.brain_initialized = datetime()
                """)
                
                session.run("""
                    MERGE (brain:System {id: "neo4j-auradb-brain"})
                    SET brain.name = "Neo4j AuraDB Knowledge Brain",
                        brain.description = "마음로그 V4.0의 두뇌 역할을 하는 지식 그래프 데이터베이스",
                        brain.type = "AuraDB Professional",
                        brain.instance_id = $instance_id,
                        brain.status = "initialized",
                        brain.created = datetime()
                """, instance_id=self.connection_info["instance_id"])
                
                # Create relationship
                session.run("""
                    MATCH (p:Project {id: "maumlog-v4"}), (b:System {id: "neo4j-auradb-brain"})
                    MERGE (p)-[:USES_BRAIN]->(b)
                """)
                
                # Create Infrastructure Architect AI node
                session.run("""
                    MERGE (dev:Developer {id: "infrastructure-architect-ai"})
                    SET dev.name = "Infrastructure Architect AI",
                        dev.role = "Gemini Code Assist",
                        dev.environment = "Google Cloud Shell IDE",
                        dev.specialization = "GCP Infrastructure & Neo4j Brain Setup",
                        dev.created = datetime(),
                        dev.status = "active"
                """)
                
                # Link to project
                session.run("""
                    MATCH (dev:Developer {id: "infrastructure-architect-ai"}), (p:Project {id: "maumlog-v4"})
                    MERGE (dev)-[:CONTRIBUTES_TO {role: "Brain Architect", phase: "PoC"}]->(p)
                """)
                
                logger.info("✓ 마음로그 V4.0 Brain Schema initialized successfully")
                return True
                
        except Exception as e:
            logger.error(f"Brain schema initialization failed: {str(e)}")
            return False

    def verify_brain_operations(self) -> bool:
        """
        Verify that the brain database operations work correctly.
        """
        try:
            with self.driver.session() as session:
                logger.info("Testing Brain Database Operations...")
                
                # Test knowledge creation
                session.run("""
                    MERGE (concept:Concept {id: "t1-risk-verification"})
                    SET concept.name = "T1 Risk Verification",
                        concept.description = "안전한 상태 전달 메커니즘 검증",
                        concept.category = "Security Pattern",
                        concept.status = "Verified",
                        concept.created = datetime()
                """)
                
                # Link to project
                session.run("""
                    MATCH (concept:Concept {id: "t1-risk-verification"}), (p:Project {id: "maumlog-v4"})
                    MERGE (concept)-[:PART_OF {importance: "Critical"}]->(p)
                """)
                
                # Test query operations
                result = session.run("""
                    MATCH (p:Project {id: "maumlog-v4"})-[:USES_BRAIN]->(brain:System)
                    MATCH (dev:Developer)-[:CONTRIBUTES_TO]->(p)
                    MATCH (concept:Concept)-[:PART_OF]->(p)
                    RETURN p.name as project_name, 
                           brain.type as brain_type, 
                           brain.instance_id as instance_id,
                           count(dev) as developers, 
                           count(concept) as concepts
                """)
                
                record = result.single()
                if record:
                    logger.info(f"Brain Operation Test Results:")
                    logger.info(f"  Project: {record['project_name']}")
                    logger.info(f"  Brain Type: {record['brain_type']}")
                    logger.info(f"  Instance ID: {record['instance_id']}")
                    logger.info(f"  Developers: {record['developers']}")
                    logger.info(f"  Concepts: {record['concepts']}")
                    
                    return True
                    
                return False
                
        except Exception as e:
            logger.error(f"Brain operations test failed: {str(e)}")
            return False

    def close_connection(self):
        """
        Close the Neo4j driver connection.
        """
        if self.driver:
            self.driver.close()
            logger.info("Neo4j AuraDB Brain connection closed")

def main():
    """
    Main function to test Neo4j AuraDB Brain connectivity and operations.
    """
    PROJECT_ID = "iness-467105"
    
    try:
        # Initialize credentials (uses default GCP authentication)
        credentials, project = default()
        logger.info(f"Using default credentials for project: {project or PROJECT_ID}")
        
        # Initialize AuraDB Brain connector
        brain_connector = AuraDBBrainConnector(PROJECT_ID)
        
        logger.info("=== 마음로그 V4.0 Neo4j AuraDB Brain Test ===")
        
        # Step 1: Test connection
        if brain_connector.connect_to_auradb_brain():
            logger.info("✓ Neo4j AuraDB Brain connection successful")
            
            # Step 2: Initialize schema
            if brain_connector.initialize_brain_schema():
                logger.info("✓ Brain database schema initialization successful")
                
                # Step 3: Test operations
                if brain_connector.verify_brain_operations():
                    logger.info("✓ Brain database operations test successful")
                    
                    logger.info("\n=== 🧠 마음로그 V4.0 Neo4j Brain 초기화 완료 ===")
                    logger.info("✓ T1 패턴으로 안전한 자격증명 검색")
                    logger.info("✓ AuraDB Professional 연결 성공")
                    logger.info("✓ 지식 그래프 스키마 초기화")
                    logger.info("✓ 기본 지식 운영 검증 완료")
                    logger.info("🚀 마음로그 V4.0의 두뇌가 준비되었습니다!")
                    
                    return 0
                    
        logger.error("Neo4j AuraDB Brain test failed")
        return 1
        
    except Exception as e:
        logger.error(f"Neo4j AuraDB Brain test failed: {str(e)}")
        return 1
        
    finally:
        if 'brain_connector' in locals():
            brain_connector.close_connection()

if __name__ == "__main__":
    sys.exit(main())