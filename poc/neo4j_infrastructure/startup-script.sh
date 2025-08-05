#!/bin/bash
# Neo4j Installation and Configuration Script for 마음로그 V4.0
# This script securely installs and configures Neo4j using T1 verified patterns

set -e

PROJECT_ID="${project_id}"
NEO4J_PASSWORD_SECRET="${neo4j_password_secret}"

# Update system
apt-get update
apt-get install -y curl wget gnupg software-properties-common

# Install Google Cloud SDK for secret access
curl https://sdk.cloud.google.com | bash
source /root/.bashrc
gcloud config set project $PROJECT_ID

# Install Java 11 (required for Neo4j)
apt-get install -y openjdk-11-jdk

# Add Neo4j repository
wget -O - https://debian.neo4j.com/neotechnology.gpg.key | apt-key add -
echo 'deb https://debian.neo4j.com stable latest' | tee -a /etc/apt/sources.list.d/neo4j.list
apt-get update

# Install Neo4j Community Edition
apt-get install -y neo4j

# Create Neo4j data directory on persistent disk
mkdir -p /data/neo4j
chown neo4j:neo4j /data/neo4j

# Mount persistent disk
DEVICE_NAME=$(lsblk | grep 200G | awk '{print $1}')
if [ ! -z "$DEVICE_NAME" ]; then
    mkfs.ext4 -F /dev/$DEVICE_NAME
    mount /dev/$DEVICE_NAME /data/neo4j
    echo "/dev/$DEVICE_NAME /data/neo4j ext4 defaults 0 0" >> /etc/fstab
    chown -R neo4j:neo4j /data/neo4j
fi

# Retrieve Neo4j password from Secret Manager (T1 Risk Verification Pattern)
NEO4J_PASSWORD=$(gcloud secrets versions access latest --secret="$NEO4J_PASSWORD_SECRET")

# Configure Neo4j
cat > /etc/neo4j/neo4j.conf << EOF
# Basic settings
dbms.default_database=maumlogv4

# Data directories
dbms.directories.data=/data/neo4j/data
dbms.directories.logs=/data/neo4j/logs

# Memory settings (optimized for 16GB RAM)
dbms.memory.heap.initial_size=4g
dbms.memory.heap.max_size=4g
dbms.memory.pagecache.size=6g

# Network settings
dbms.default_listen_address=0.0.0.0
dbms.connector.bolt.enabled=true
dbms.connector.bolt.listen_address=:7687
dbms.connector.http.enabled=true
dbms.connector.http.listen_address=:7474

# Security settings
dbms.security.auth_enabled=true
dbms.security.procedures.unrestricted=apoc.*

# Performance settings
dbms.tx_log.rotation.retention_policy=100M size
dbms.checkpoint.interval.time=15m

# Logging
dbms.logs.gc.enabled=true
dbms.logs.gc.options=-Xloggc:/data/neo4j/logs/gc.log -XX:+UseG1GC
EOF

# Set initial password
neo4j-admin set-initial-password "$NEO4J_PASSWORD"

# Install APOC plugin for advanced procedures
wget https://github.com/neo4j-contrib/neo4j-apoc-procedures/releases/download/4.4.0.18/apoc-4.4.0.18-all.jar -O /var/lib/neo4j/plugins/apoc.jar
chown neo4j:neo4j /var/lib/neo4j/plugins/apoc.jar

# Create systemd service
systemctl enable neo4j
systemctl start neo4j

# Wait for Neo4j to start
sleep 30

# Create initial knowledge schema
cat > /tmp/init_schema.cypher << 'SCHEMA_EOF'
// Initialize 마음로그 V4.0 Neo4j Brain Database
// Create basic constraints and indexes for PoC

// Developer nodes
CREATE CONSTRAINT developer_id_unique IF NOT EXISTS FOR (d:Developer) REQUIRE d.id IS UNIQUE;
CREATE INDEX developer_name_index IF NOT EXISTS FOR (d:Developer) ON (d.name);

// Project nodes
CREATE CONSTRAINT project_id_unique IF NOT EXISTS FOR (p:Project) REQUIRE p.id IS UNIQUE;
CREATE INDEX project_name_index IF NOT EXISTS FOR (p:Project) ON (p.name);

// Commit nodes
CREATE CONSTRAINT commit_hash_unique IF NOT EXISTS FOR (c:Commit) REQUIRE c.hash IS UNIQUE;
CREATE INDEX commit_timestamp_index IF NOT EXISTS FOR (c:Commit) ON (c.timestamp);

// File nodes
CREATE CONSTRAINT file_path_unique IF NOT EXISTS FOR (f:File) REQUIRE f.path IS UNIQUE;
CREATE INDEX file_type_index IF NOT EXISTS FOR (f:File) ON (f.extension);

// Function nodes
CREATE CONSTRAINT function_signature_unique IF NOT EXISTS FOR (fn:Function) REQUIRE fn.signature IS UNIQUE;
CREATE INDEX function_name_index IF NOT EXISTS FOR (fn:Function) ON (fn.name);

// Concept nodes
CREATE CONSTRAINT concept_id_unique IF NOT EXISTS FOR (con:Concept) REQUIRE con.id IS UNIQUE;
CREATE INDEX concept_name_index IF NOT EXISTS FOR (con:Concept) ON (con.name);

// Create initial PoC data
CREATE (p:Project {
  id: "maumlog-v4",
  name: "마음로그 V4.0",
  description: "AI 전문가 조립 라인 기반 자율 개발 생태계",
  created: datetime(),
  phase: "PoC"
});

CREATE (brain:System {
  id: "neo4j-brain",
  name: "Neo4j Knowledge Brain",
  description: "마음로그 V4.0의 두뇌 역할을 하는 지식 그래프 데이터베이스",
  status: "initialized",
  created: datetime()
});

MATCH (p:Project {id: "maumlog-v4"}), (b:System {id: "neo4j-brain"})
CREATE (p)-[:USES_BRAIN]->(b);
SCHEMA_EOF

# Execute schema initialization
cypher-shell -u neo4j -p "$NEO4J_PASSWORD" -f /tmp/init_schema.cypher

# Log successful installation
echo "Neo4j Brain Database for 마음로그 V4.0 successfully initialized" > /var/log/neo4j-setup.log
echo "Database URL: bolt://$(hostname -I | awk '{print $1}'):7687" >> /var/log/neo4j-setup.log
echo "Installation completed at: $(date)" >> /var/log/neo4j-setup.log