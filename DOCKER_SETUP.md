# Docker Development Environment Setup

Complete guide for running Globe Scholars with Docker.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Services Architecture](#services-architecture)
- [Development Workflow](#development-workflow)
- [Technical Details](#technical-details)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

- Docker (20.10+)
- Docker Compose (2.0+)

---

## Quick Start

### 1. Clone Repository
```bash
git clone https://github.com/elizaveta-andreeva/globe-scholars.git
cd globe-scholars
```

### 2. Configure Environment
```bash
# Copy environment template
cp .env.example .env

# Edit with your credentials (optional - defaults work fine)
nano .env
```

### 3. Start Services
```bash
# Start all containers
docker-compose up -d

# Run database migrations
docker-compose exec backend python manage.py migrate

# Create admin user
docker-compose exec backend python manage.py createsuperuser
```

### 4. Access Application
- **Frontend:** http://localhost:4200
- **Backend API:** http://localhost:8001
- **API Documentation:** http://localhost:8001/api/docs/
- **Django Admin:** http://localhost:8001/admin/

---

## Services Architecture
```
Docker Network (bridge)
│
├── PostgreSQL Container
│   ├── Port: 5433 → 5432
│   ├── Database: globe_scholars
│   └── Volume: postgres_data (persistent)
│
├── Redis Container
│   ├── Port: 6380 → 6379
│   └── Used by: Celery task queue
│
├── Django Backend Container
│   ├── Port: 8001 → 8000
│   ├── Hot reload: Enabled
│   └── Volume mount: ./backend → /app
│
├── Celery Worker Container
│   ├── Processes: Background tasks
│   └── Connected to: PostgreSQL, Redis
│
└── Angular Frontend Container
    ├── Port: 4200 → 4200
    ├── Hot reload: Enabled
    └── Volume mount: ./frontend/globe-scholars → /app
```

---

## Development Workflow

### Daily Usage
```bash
# Start everything
docker-compose up -d

# View logs (all services)
docker-compose logs -f

# View logs (specific service)
docker-compose logs -f backend
docker-compose logs -f frontend

# Stop everything
docker-compose down

# Stop and remove all data (⚠️ deletes database!)
docker-compose down -v
```

### Running Commands
```bash
# Django management commands
docker-compose exec backend python manage.py migrate
docker-compose exec backend python manage.py createsuperuser
docker-compose exec backend python manage.py shell

# Install new Python package
# 1. Add to backend/requirements.txt
# 2. Rebuild
docker-compose build backend
docker-compose up -d backend

# Install new npm package
docker-compose exec frontend npm install package-name
```

### Code Changes

**Backend (Python):**
1. Edit files in `backend/` folder
2. Save → Django auto-reloads
3. Changes visible immediately at http://localhost:8001

**Frontend (Angular):**
1. Edit files in `frontend/globe-scholars/` folder
2. Save → Angular rebuilds
3. Browser auto-refreshes at http://localhost:4200

---

## Technical Details

### Port Mapping Rationale

| Service | Host Port | Container Port | Why Different? |
|---------|-----------|----------------|----------------|
| PostgreSQL | 5433 | 5432 | Avoid conflict with local PostgreSQL |
| Redis | 6380 | 6379 | Avoid conflict with local Redis |
| Django | 8001 | 8000 | Avoid conflict with local dev server |
| Angular | 4200 | 4200 | Standard Angular port (no conflict) |

### Volume Strategy

**Code Volumes (Hot Reload):**
```yaml
- ./backend:/app              # Backend code
- ./frontend/globe-scholars:/app  # Frontend code
```
Changes sync instantly between host and container.

**Named Volumes (Persistent Data):**
```yaml
postgres_data:  # Database files survive restarts
media_files:    # Uploaded files persist
```

**Anonymous Volumes (Isolation):**
```yaml
/app/node_modules  # Prevents local/container conflicts
```

### Environment Variables

**Stored in `.env` (not committed to git):**
```bash
POSTGRES_DB=globe_scholars
POSTGRES_USER=globe_user
POSTGRES_PASSWORD=your_secure_password
DEBUG=True
SECRET_KEY=your_secret_key
```

**Template in `.env.example` (safe to commit):**
Contains placeholder values for team reference.

### Health Checks

**PostgreSQL:**
```yaml
pg_isready -U globe_user -d globe_scholars
```
Ensures database is ready before backend starts.

**Redis:**
```yaml
redis-cli ping
```
Confirms Redis responds before Celery connects.

---

## Troubleshooting

### Port Already in Use

**Error:** `Bind for 0.0.0.0:5432 failed: port is already allocated`

**Solution:**
```bash
# Check what's using the port
sudo lsof -i :5432

# Stop local PostgreSQL
sudo systemctl stop postgresql

# Or change Docker port in docker-compose.yaml
ports:
  - "5433:5432"  # Use different host port
```

### Container Won't Start

**Check logs:**
```bash
docker-compose logs backend
docker-compose logs frontend
```

**Common fixes:**
```bash
# Rebuild from scratch
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# Check running containers
docker-compose ps
```

### Database Connection Errors

**Error:** `FATAL: database "globe_user" does not exist`

**Solution:** Update healthcheck in docker-compose.yaml:
```yaml
healthcheck:
  test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER} -d ${POSTGRES_DB}"]
```

### Frontend Not Hot Reloading

**Solution:** Ensure `CHOKIDAR_USEPOLLING=true` in docker-compose.yaml:
```yaml
frontend:
  environment:
    - CHOKIDAR_USEPOLLING=true
```

### Migrations Not Applied
```bash
# Run migrations manually
docker-compose exec backend python manage.py migrate

# Check migration status
docker-compose exec backend python manage.py showmigrations
```

---

## File Structure
```
globe-scholars/
├── .env                    # Your secrets (NOT in git)
├── .env.example            # Template (safe to commit)
├── .gitignore              # Excludes .env, __pycache__, etc.
├── docker-compose.yaml     # Orchestration config
├── DOCKER_SETUP.md         # This file
│
├── backend/
│   ├── Dockerfile          # Backend container definition
│   ├── requirements.txt    # Python dependencies
│   └── manage.py
│
└── frontend/
    ├── Dockerfile          # Frontend container definition
    ├── .dockerignore       # Exclude node_modules from build
    └── globe-scholars/     # Angular app
```

---

## Benefits

✅ **Consistency:** Identical environment for all developers  
✅ **Speed:** 5-minute onboarding for new team members  
✅ **Isolation:** No conflicts with system Python/Node/PostgreSQL  
✅ **Portability:** Works on Linux, macOS, Windows  
✅ **Production-like:** Development mirrors deployment  
✅ **Hot Reload:** Code changes reflect without rebuilds  

---

## Future Improvements

- [ ] Add Nginx reverse proxy
- [ ] Multi-stage builds for smaller images
- [ ] Production docker-compose.prod.yaml
- [ ] CI/CD pipeline integration
- [ ] Kubernetes deployment configs

---

## Common Commands Cheat Sheet
```bash
# Start
docker-compose up -d

# Stop
docker-compose down

# Rebuild
docker-compose build
docker-compose up -d --build

# View logs
docker-compose logs -f [service]

# Run command in container
docker-compose exec backend [command]
docker-compose exec frontend [command]

# Restart single service
docker-compose restart backend

# Check status
docker-compose ps

# Remove everything (including volumes)
docker-compose down -v
```