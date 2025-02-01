# main.tf

provider "mongodbatlas" {
  public_key  = var.MONGO_PUBLIC_KEY
  private_key = var.MONGO_PRIVATE_KEY
}

# Create MongoDB Atlas Project
resource "mongodbatlas_project" "project" {
  name   = "my-project"
  org_id = var.MONGO_ORG_ID
}

# Create MongoDB Atlas Cluster with ca-central-1 region
resource "mongodbatlas_cluster" "cluster" {
  project_id   = mongodbatlas_project.project.id
  name         = "my-cluster"
  cluster_type = "REPLICASET"
  disk_size_gb = 10
  provider_name = "AWS"
  region_name   = "CA_CENTRAL_1"  # Changed to Canada Central region (ca-central-1)
  
  backup_enabled = true

  mongo_db_major_version = "4.2"
}

# Create Database User
resource "mongodbatlas_database_user" "db_user" {
  project_id = mongodbatlas_project.project.id
  username   = var.MONGO_USERNAME   # MongoDB username from environment variable
  password   = var.MONGO_PASSWORD   # Password from environment variable

  roles {
    role_name   = "readWrite"
    database_name = "admin"
  }

  authentication_database = "admin"
  mongo_db_major_version = "4.2"
}

# Network Peering Configuration (Allowing all IPs)
resource "mongodbatlas_network_peering" "peering" {
  project_id        = mongodbatlas_project.project.id
  container_id      = mongodbatlas_cluster.cluster.id
  cidr_block        = "0.0.0.0/0"  # Allowing access from all IPs
  peer_project_id   = mongodbatlas_project.project.id
  peer_container_id = mongodbatlas_cluster.cluster.id
}

# Declare sensitive variables
variable "MONGO_PUBLIC_KEY" {
  description = "MongoDB Atlas Public API Key"
  type        = string
  sensitive   = true
}

variable "MONGO_PRIVATE_KEY" {
  description = "MongoDB Atlas Private API Key"
  type        = string
  sensitive   = true
}

variable "MONGO_ORG_ID" {
  description = "MongoDB Atlas Organization ID"
  type        = string
  sensitive   = true
}

variable "MONGO_PASSWORD" {
  description = "MongoDB Atlas User Password"
  type        = string
  sensitive   = true
}

variable "MONGO_USERNAME" {
  description = "MongoDB Atlas User Username"
  type        = string
  sensitive   = true
}

variable "MONGO_CLUSTER_URL" {
  description = "MongoDB Atlas Cluster URL"
  type        = string
  sensitive   = true
}