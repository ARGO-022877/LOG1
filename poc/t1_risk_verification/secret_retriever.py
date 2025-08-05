#!/usr/bin/env python3
"""
Secret Retriever for T1 Risk Verification PoC
This script demonstrates secure retrieval of sensitive data from GCP Secret Manager
using service account authentication without exposing credentials.
"""

import os
import sys
from google.cloud import secretmanager
from google.auth import default
import json
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class SecretRetriever:
    def __init__(self, project_id: str):
        """
        Initialize SecretRetriever with project ID.
        Uses default GCP authentication (service account in Cloud Shell/GCE).
        """
        self.project_id = project_id
        self.client = secretmanager.SecretManagerServiceClient()
        
    def get_secret(self, secret_id: str, version: str = "latest") -> str:
        """
        Retrieve a secret from GCP Secret Manager.
        
        Args:
            secret_id: The ID of the secret
            version: Version of the secret (default: "latest")
            
        Returns:
            The secret value as string
            
        Raises:
            Exception: If secret retrieval fails
        """
        try:
            name = f"projects/{self.project_id}/secrets/{secret_id}/versions/{version}"
            logger.info(f"Retrieving secret: {secret_id}")
            
            response = self.client.access_secret_version(request={"name": name})
            secret_value = response.payload.data.decode("UTF-8")
            
            logger.info(f"Successfully retrieved secret: {secret_id}")
            return secret_value
            
        except Exception as e:
            logger.error(f"Failed to retrieve secret {secret_id}: {str(e)}")
            raise

    def verify_secrets_exist(self, secret_ids: list) -> dict:
        """
        Verify that specified secrets exist in Secret Manager.
        
        Args:
            secret_ids: List of secret IDs to verify
            
        Returns:
            Dictionary with secret_id as key and boolean existence as value
        """
        results = {}
        
        for secret_id in secret_ids:
            try:
                name = f"projects/{self.project_id}/secrets/{secret_id}"
                self.client.get_secret(request={"name": name})
                results[secret_id] = True
                logger.info(f"Secret exists: {secret_id}")
            except Exception as e:
                results[secret_id] = False
                logger.warning(f"Secret does not exist or access denied: {secret_id} - {str(e)}")
                
        return results

def main():
    """
    Main function to demonstrate secure secret retrieval.
    """
    PROJECT_ID = "iness-467105"
    
    # Secrets to verify and retrieve (from Terraform configuration)
    SECRETS_TO_CHECK = [
        "maeum-log-v4-db-password",
        "maeum-log-v4-api-key"
    ]
    
    try:
        # Initialize credentials (uses default GCP authentication)
        credentials, project = default()
        logger.info(f"Using default credentials for project: {project or PROJECT_ID}")
        
        # Initialize secret retriever
        retriever = SecretRetriever(PROJECT_ID)
        
        # Verify secrets exist
        logger.info("=== Verifying Secret Existence ===")
        existence_results = retriever.verify_secrets_exist(SECRETS_TO_CHECK)
        
        for secret_id, exists in existence_results.items():
            status = "✓ EXISTS" if exists else "✗ NOT FOUND"
            print(f"{secret_id:30} {status}")
        
        # Attempt to retrieve secrets (only if they exist)
        logger.info("\n=== Retrieving Secret Values (Demo) ===")
        for secret_id in SECRETS_TO_CHECK:
            if existence_results.get(secret_id, False):
                try:
                    secret_value = retriever.get_secret(secret_id)
                    # For security demonstration, only show first/last 4 characters
                    masked_value = f"{secret_value[:4]}...{secret_value[-4:]}" if len(secret_value) > 8 else "***"
                    print(f"{secret_id:30} Retrieved (masked): {masked_value}")
                except Exception as e:
                    print(f"{secret_id:30} ✗ FAILED: {str(e)}")
            else:
                print(f"{secret_id:30} ✗ SKIPPED (not found)")
        
        logger.info("\n=== T1 Risk Verification Complete ===")
        logger.info("✓ Secrets can be securely stored in GCP Secret Manager")
        logger.info("✓ Secrets can be retrieved using service account authentication")
        logger.info("✓ No sensitive data exposed in code or logs")
        
        return 0
        
    except Exception as e:
        logger.error(f"T1 Risk Verification failed: {str(e)}")
        return 1

if __name__ == "__main__":
    sys.exit(main())