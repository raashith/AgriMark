# AgriMark Deployment & DevOps Guide

## 1. Environment Configurations
- **Development**: SQLite in-memory / local PostgreSQL, debug mode enabled
- **Staging**: Managed Supabase PostgreSQL, Docker containerized FastAPI
- **Production**: Distributed Supabase PostgreSQL cluster, Kubernetes / Docker Swarm

## 2. Docker & Containerization
- **Dockerfile**: Located at `deployment/Dockerfile`
- **Docker Compose**: Located at `deployment/docker-compose.yml`

```bash
# Spin up backend and database containers
docker-compose -f deployment/docker-compose.yml up -d
```

## 3. Database Migrations on Deployment
```bash
cd backend
alembic upgrade head
```
