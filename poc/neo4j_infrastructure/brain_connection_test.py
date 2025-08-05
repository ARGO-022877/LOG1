#!/usr/bin/env python3
"""
Neo4j Brain Connection Test for 마음로그 V4.0
This script tests secure connection to Neo4j using T1 verified patterns
"""

import os
import sys
from google.cloud import secretmanager
from google.auth import default
import logging
from neo4j import GraphDatabase
import time

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class Neo4jBrainConnector:
    def __init__(self, project_id: str):
        """
        Initialize Neo4j Brain Connector with secure credential retrieval.
        Uses T1 Risk Verification proven pattern for safe state transfer.
        """
        self.project_id = project_id
        self.client = secretmanager.SecretManagerServiceClient()
        self.driver = None
        
    def get_neo4j_credentials(self) -> dict:
        """
        Retrieve Neo4j credentials from GCP Secret Manager.
        Implements T1 verified secure state transfer pattern.
        """
        try:
            # Get Neo4j admin password
            password_secret_name = f"projects/{self.project_id}/secrets/maeum-log-v4-neo4j-admin-password/versions/latest"
            password_response = self.client.access_secret_version(request={"name": password_secret_name})
            password = password_response.payload.data.decode("UTF-8")
            
            logger.info("Successfully retrieved Neo4j credentials from Secret Manager")
            
            return {
                "username": "neo4j",
                "password": password
            }
            
        except Exception as e:
            logger.error(f"Failed to retrieve Neo4j credentials: {str(e)}")
            raise

    def connect_to_brain(self, neo4j_uri: str) -> bool:
        """
        Establish secure connection to Neo4j Brain database.
        """
        try:
            credentials = self.get_neo4j_credentials()
            
            self.driver = GraphDatabase.driver(
                neo4j_uri,
                auth=(credentials["username"], credentials["password"])
            )
            
            # Test connection
            with self.driver.session() as session:
                result = session.run("RETURN 'Brain Connection Successful' as message")
                message = result.single()["message"]
                logger.info(f"Neo4j Brain connection test: {message}")
                
            return True
            
        except Exception as e:
            logger.error(f"Failed to connect to Neo4j Brain: {str(e)}")
            return False

    def verify_brain_schema(self) -> bool:
        """
        Verify that the brain database has the correct schema initialized.
        """
        try:
            with self.driver.session() as session:
                # Check if initial project node exists
                result = session.run("""
                    MATCH (p:Project {id: 'maumlog-v4'})
                    RETURN p.name as project_name, p.phase as phase
                """)
                
                record = result.single()
                if record:
                    logger.info(f"Brain Schema Verification: Found project '{record['project_name']}' in phase '{record['phase']}'")
                    
                    # Check brain system node
                    brain_result = session.run("""
                        MATCH (b:System {id: 'neo4j-brain'})
                        RETURN b.name as brain_name, b.status as status
                    """)
                    
                    brain_record = brain_result.single()
                    if brain_record:
                        logger.info(f"Brain System Status: {brain_record['brain_name']} - {brain_record['status']}")
                        return True
                    
                return False
                
        except Exception as e:
            logger.error(f"Brain schema verification failed: {str(e)}")
            return False

    def test_knowledge_operations(self) -> bool:
        """
        Test basic knowledge graph operations.
        """
        try:
            with self.driver.session() as session:
                # Create a test developer node
                session.run("""
                    MERGE (d:Developer {id: 'test-dev-001'})
                    SET d.name = 'Infrastructure Architect AI',
                        d.role = 'Gemini Code Assist',
                        d.created = datetime(),
                        d.test = true
                """)
                
                # Create relationship with project
                session.run("""
                    MATCH (d:Developer {id: 'test-dev-001'}), (p:Project {id: 'maumlog-v4'})
                    MERGE (d)-[:CONTRIBUTES_TO]->(p)
                """)
                
                # Verify the test data
                result = session.run("""
                    MATCH (d:Developer {id: 'test-dev-001'})-[r:CONTRIBUTES_TO]->(p:Project)
                    RETURN d.name as dev_name, d.role as dev_role, p.name as project_name
                """)
                
                record = result.single()
                if record:
                    logger.info(f"Knowledge Operation Test: {record['dev_name']} ({record['dev_role']}) contributes to {record['project_name']}")
                    
                    # Clean up test data
                    session.run("MATCH (d:Developer {test: true}) DETACH DELETE d")
                    logger.info("Test data cleaned up successfully")
                    
                    return True
                    
                return False
                
        except Exception as e:
            logger.error(f"Knowledge operations test failed: {str(e)}")
            return False

    def close_connection(self):
        """
        Close the Neo4j driver connection.
        """
        if self.driver:
            self.driver.close()
            logger.info("Neo4j Brain connection closed")

def main():
    """
    Main function to test Neo4j Brain connectivity and operations.
    """
    PROJECT_ID = "iness-467105"
    
    # Note: Update this with actual Neo4j instance internal IP after deployment
    NEO4J_URI = "bolt://10.0.1.2:7687"  # Will be updated with actual IP
    
    try:
        # Initialize credentials (uses default GCP authentication)
        credentials, project = default()
        logger.info(f"Using default credentials for project: {project or PROJECT_ID}")
        
        # Initialize Neo4j Brain connector
        brain_connector = Neo4jBrainConnector(PROJECT_ID)
        
        logger.info("=== Neo4j Brain Connectivity Test ===")
        
        # Step 1: Test connection
        if brain_connector.connect_to_brain(NEO4J_URI):
            logger.info("✓ Neo4j Brain connection successful")
            
            # Step 2: Verify schema
            if brain_connector.verify_brain_schema():
                logger.info("✓ Brain database schema verification successful")
                
                # Step 3: Test knowledge operations
                if brain_connector.test_knowledge_operations():
                    logger.info("✓ Knowledge graph operations test successful")
                    
                    logger.info("\n=== 마음로그 V4.0 Neo4j Brain Test Complete ===")
                    logger.info("✓ Secure credential retrieval (T1 pattern)")
                    logger.info("✓ Brain database connectivity")
                    logger.info("✓ Schema initialization verified")
                    logger.info("✓ Knowledge operations functional")
                    logger.info("🧠 The Brain is ready for 마음로그 V4.0!")
                    
                    return 0
                    
        logger.error("Neo4j Brain test failed")
        return 1
        
    except Exception as e:
        logger.error(f"Neo4j Brain test failed: {str(e)}")
        return 1
        
    finally:
        if 'brain_connector' in locals():
            brain_connector.close_connection()

if __name__ == "__main__":
    sys.exit(main())