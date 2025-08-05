# Neo4j Infrastructure for 마음로그 V4.0 - The Brain
# This Terraform configuration sets up Neo4j database infrastructure
# with secure state transfer mechanism proven in T1 risk verification

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
  
  # Remote state for secure state management
  backend "gcs" {
    bucket = "iness-467105-tfstate"
    prefix = "terraform/neo4j-infrastructure"
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

# Variables
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

variable "zone" {
  description = "GCP Zone"
  type        = string
  default     = "us-central1-a"
}

# Network for Neo4j
resource "google_compute_network" "neo4j_network" {
  name                    = "maeum-log-v4-neo4j-network"
  auto_create_subnetworks = false
  
  description = "Network for 마음로그 V4.0 Neo4j - The Brain of the system"
}

resource "google_compute_subnetwork" "neo4j_subnet" {
  name          = "maeum-log-v4-neo4j-subnet"
  ip_cidr_range = "10.0.1.0/24"
  region        = var.region
  network       = google_compute_network.neo4j_network.id
  
  private_ip_google_access = true
}

# Firewall rules
resource "google_compute_firewall" "neo4j_bolt" {
  name    = "allow-neo4j-bolt"
  network = google_compute_network.neo4j_network.name
  
  allow {
    protocol = "tcp"
    ports    = ["7687"]  # Neo4j Bolt protocol
  }
  
  source_ranges = ["10.0.1.0/24"]  # Internal only
  target_tags   = ["neo4j"]
}

resource "google_compute_firewall" "neo4j_http" {
  name    = "allow-neo4j-http"
  network = google_compute_network.neo4j_network.name
  
  allow {
    protocol = "tcp"
    ports    = ["7474"]  # Neo4j HTTP
  }
  
  source_ranges = ["10.0.1.0/24"]  # Internal only
  target_tags   = ["neo4j"]
}

# Generate secure passwords for Neo4j
resource "random_password" "neo4j_admin_password" {
  length  = 32
  special = true
  upper   = true
  lower   = true
  numeric = true
}

# Store Neo4j credentials in Secret Manager (T1 Risk Verification Pattern)
resource "google_secret_manager_secret" "neo4j_admin_password" {
  secret_id = "maeum-log-v4-neo4j-admin-password"
  
  replication {
    auto {}
  }
  
  labels = {
    project     = "maeum-log-v4"
    environment = "poc"
    component   = "neo4j"
    risk_level  = "high"
    description = "brain-database-credentials"
  }
}

resource "google_secret_manager_secret_version" "neo4j_admin_password" {
  secret      = google_secret_manager_secret.neo4j_admin_password.id
  secret_data = random_password.neo4j_admin_password.result
}

# Service account for Neo4j instance
resource "google_service_account" "neo4j_sa" {
  account_id   = "neo4j-brain-sa"
  display_name = "Neo4j Brain Service Account"
  description  = "Service account for 마음로그 V4.0 Neo4j - The Brain"
}

# Grant necessary permissions
resource "google_project_iam_member" "neo4j_secret_accessor" {
  project = var.project_id
  role    = "roles/secretmanager.secretAccessor"
  member  = "serviceAccount:${google_service_account.neo4j_sa.email}"
}

resource "google_project_iam_member" "neo4j_logs_writer" {
  project = var.project_id
  role    = "roles/logging.logWriter"
  member  = "serviceAccount:${google_service_account.neo4j_sa.email}"
}

# Neo4j instance configuration
resource "google_compute_instance" "neo4j" {
  name         = "maeum-log-v4-neo4j-brain"
  machine_type = "n2-standard-4"  # 4 vCPUs, 16GB RAM
  zone         = var.zone
  
  tags = ["neo4j"]
  
  boot_disk {
    initialize_params {
      image = "ubuntu-os-cloud/ubuntu-2204-lts"
      size  = 100  # 100GB for graph data
      type  = "pd-ssd"
    }
  }
  
  network_interface {
    network    = google_compute_network.neo4j_network.id
    subnetwork = google_compute_subnetwork.neo4j_subnet.id
    
    access_config {
      # Ephemeral external IP for initial setup
    }
  }
  
  service_account {
    email  = google_service_account.neo4j_sa.email
    scopes = ["cloud-platform"]
  }
  
  metadata_startup_script = templatefile("${path.module}/startup-script.sh", {
    project_id = var.project_id
    neo4j_password_secret = google_secret_manager_secret.neo4j_admin_password.secret_id
  })
  
  labels = {
    project     = "maeum-log-v4"
    environment = "poc"
    component   = "neo4j"
    role        = "brain-database"
  }
}

# Persistent disk for Neo4j data
resource "google_compute_disk" "neo4j_data" {
  name = "maeum-log-v4-neo4j-data"
  type = "pd-ssd"
  zone = var.zone
  size = 200  # 200GB for knowledge graph growth
  
  labels = {
    project   = "maeum-log-v4"
    component = "neo4j"
    purpose   = "knowledge-storage"
  }
}

resource "google_compute_attached_disk" "neo4j_data_attachment" {
  disk     = google_compute_disk.neo4j_data.id
  instance = google_compute_instance.neo4j.id
}

# Outputs for secure state transfer
output "neo4j_instance_name" {
  description = "Name of the Neo4j instance"
  value       = google_compute_instance.neo4j.name
}

output "neo4j_internal_ip" {
  description = "Internal IP of Neo4j instance"
  value       = google_compute_instance.neo4j.network_interface[0].network_ip
}

output "neo4j_network_name" {
  description = "Name of the Neo4j network"
  value       = google_compute_network.neo4j_network.name
}

output "neo4j_admin_password_secret_name" {
  description = "Secret Manager secret name for Neo4j admin password"
  value       = google_secret_manager_secret.neo4j_admin_password.secret_id
}

output "neo4j_service_account_email" {
  description = "Email of the Neo4j service account"
  value       = google_service_account.neo4j_sa.email
}