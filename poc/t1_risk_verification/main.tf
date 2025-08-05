# T1 Risk Verification PoC - Secure State Transfer
# This Terraform configuration demonstrates secure handling of sensitive data
# using GCP Secret Manager without exposing credentials in Git or logs

terraform {
  required_version = ">= 1.0"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 4.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.1"
    }
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

variable "project_id" {
  description = "GCP Project ID"
  type        = string
  default     = "iness-467105"
}

variable "region" {
  description = "GCP Region"
  type        = string
  default     = "us-central1"
}

# Generate a random password for demonstration
resource "random_password" "db_password" {
  length  = 32
  special = true
  upper   = true
  lower   = true
  numeric = true
}

# Create Secret Manager secret for database password
resource "google_secret_manager_secret" "db_password" {
  secret_id = "maeum-log-v4-db-password"
  
  replication {
    auto {}
  }

  labels = {
    project     = "maeum-log-v4"
    environment = "poc"
    component   = "database"
    risk_level  = "high"
  }
}

# Store the generated password in Secret Manager
resource "google_secret_manager_secret_version" "db_password" {
  secret      = google_secret_manager_secret.db_password.id
  secret_data = random_password.db_password.result
}

# Create additional secret for API key demonstration
resource "random_password" "api_key" {
  length  = 64
  special = false
  upper   = true
  lower   = true
  numeric = true
}

resource "google_secret_manager_secret" "api_key" {
  secret_id = "maeum-log-v4-api-key"
  
  replication {
    auto {}
  }

  labels = {
    project     = "maeum-log-v4"
    environment = "poc"
    component   = "api"
    risk_level  = "high"
  }
}

resource "google_secret_manager_secret_version" "api_key" {
  secret      = google_secret_manager_secret.api_key.id
  secret_data = random_password.api_key.result
}

# Output only the secret names/IDs, never the actual values
output "db_password_secret_name" {
  description = "Name of the database password secret in Secret Manager"
  value       = google_secret_manager_secret.db_password.secret_id
}

output "api_key_secret_name" {
  description = "Name of the API key secret in Secret Manager"
  value       = google_secret_manager_secret.api_key.secret_id
}

output "project_id" {
  description = "GCP Project ID"
  value       = var.project_id
}