# RWA DEX - Deployment Guide

Complete guide for deploying the RWA DEX backend system to production.

## 🏗️ Infrastructure Requirements

### Minimum Requirements
- **Server**: 4 CPU cores, 8GB RAM, 100GB SSD
- **Database**: PostgreSQL 15+ with 50GB storage
- **Cache**: Redis 7+ with 4GB memory
- **Network**: 100 Mbps bandwidth
- **SSL**: Valid SSL certificates

### Recommended Production Setup
- **API Server**: 8 CPU cores, 16GB RAM, 200GB SSD
- **AI Engine Server**: 8 CPU cores, 32GB RAM, 100GB SSD
- **Database**: PostgreSQL cluster with read replicas
- **Cache**: Redis cluster with failover
- **Load Balancer**: Nginx or AWS ALB
- **Monitoring**: Prometheus + Grafana

## 🐳 Docker Deployment

### 1. Production Docker Compose

Create `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: ${DB_NAME}
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql:ro
    restart: unless-stopped
    deploy:
      resources:
        limits:
          memory: 2G
        reservations:
          memory: 1G

  redis:
    image: redis:7-alpine
    command: redis-server --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    restart: unless-stopped
    deploy:
      resources:
        limits:
          memory: 1G

  api:
    build:
      context: ./api
      dockerfile: Dockerfile.prod
    environment:
      NODE_ENV: production
      DATABASE_URL: postgresql://${DB_USER}:${DB_PASSWORD}@postgres:5432/${DB_NAME}
      REDIS_URL: redis://:${REDIS_PASSWORD}@redis:6379
      JWT_SECRET: ${JWT_SECRET}
      # Add other production env vars
    depends_on:
      - postgres
      - redis
    restart: unless-stopped
    deploy:
      replicas: 3
      resources:
        limits:
          memory: 1G

  ai-engine:
    build:
      context: ./ai-engine
      dockerfile: Dockerfile.prod
    environment:
      REDIS_URL: redis://:${REDIS_PASSWORD}@redis:6379
      AI_DATABASE_URL: postgresql://${DB_USER}:${DB_PASSWORD}@postgres:5432/${DB_NAME}
      AI_ENGINE_API_KEY: ${AI_ENGINE_API_KEY}
    depends_on:
      - postgres
      - redis
    restart: unless-stopped
    deploy:
      replicas: 2
      resources:
        limits:
          memory: 2G

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.prod.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/ssl/certs:ro
    depends_on:
      - api
      - ai-engine
    restart: unless-stopped

volumes:
  postgres_data:
    driver: local
  redis_data:
    driver: local
```

### 2. Production Environment Variables

Create `.env.prod`:

```bash
# Database
DB_NAME=rwa_dex_prod
DB_USER=rwa_dex_user
DB_PASSWORD=your_very_secure_db_password

# Redis
REDIS_PASSWORD=your_redis_password

# JWT
JWT_SECRET=your_256_bit_secret_key_here_make_it_very_long_and_random

# Blockchain (Mantle Mainnet)
MANTLE_RPC_URL=https://rpc.mantle.xyz
PRIVATE_KEY=your_production_wallet_private_key

# Contract Addresses (Update after deployment)
DEX_CORE_ADDRESS=0x742d35Cc7970C1C2dE54DfB8b3E82F0F68659C03
RWA_FACTORY_ADDRESS=0xA0b86a33E6441D9E8E99C0B5c0aE4E5F4e1d00f5
COMPLIANCE_REGISTRY_ADDRESS=0x123...
LENDING_PROTOCOL_ADDRESS=0x456...
YIELD_DISTRIBUTOR_ADDRESS=0x789...
PRICE_ORACLE_ADDRESS=0xabc...

# AI Engine
AI_ENGINE_API_KEY=production_ai_key_here

# External APIs
COINMARKETCAP_API_KEY=your_production_api_key
CHAINLINK_API_KEY=your_chainlink_api_key

# SSL
SSL_CERT_PATH=/etc/ssl/certs/rwa-dex.crt
SSL_KEY_PATH=/etc/ssl/certs/rwa-dex.key
```

### 3. Production Nginx Configuration

Create `nginx/nginx.prod.conf`:

```nginx
events {
    worker_connections 4096;
}

http {
    # Rate limiting zones
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=ai:10m rate=5r/s;
    limit_req_zone $binary_remote_addr zone=auth:10m rate=1r/s;
    
    # Upstream servers
    upstream api_backend {
        least_conn;
        server api:5000 max_fails=3 fail_timeout=30s;
        # Add more API instances if using multiple replicas
    }
    
    upstream ai_backend {
        least_conn;
        server ai-engine:8001 max_fails=3 fail_timeout=30s;
        # Add more AI instances if using multiple replicas
    }

    # SSL configuration
    server {
        listen 80;
        server_name your-domain.com www.your-domain.com;
        return 301 https://$server_name$request_uri;
    }

    server {
        listen 443 ssl http2;
        server_name your-domain.com www.your-domain.com;

        # SSL certificates
        ssl_certificate /etc/ssl/certs/rwa-dex.crt;
        ssl_certificate_key /etc/ssl/certs/rwa-dex.key;
        
        # SSL optimization
        ssl_session_cache shared:le_nginx_SSL:10m;
        ssl_session_timeout 1440m;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_prefer_server_ciphers off;
        ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;

        # Security headers
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
        add_header X-Frame-Options DENY always;
        add_header X-Content-Type-Options nosniff always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header Referrer-Policy "strict-origin-when-cross-origin" always;

        # Gzip compression
        gzip on;
        gzip_vary on;
        gzip_min_length 1024;
        gzip_types application/json application/javascript text/css text/javascript;

        # API routes
        location /api/ {
            limit_req zone=api burst=20 nodelay;
            
            proxy_pass http://api_backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            
            proxy_connect_timeout 5s;
            proxy_send_timeout 60s;
            proxy_read_timeout 60s;
        }

        # Authentication endpoints (stricter rate limiting)
        location ~ ^/api/auth/(connect|nonce) {
            limit_req zone=auth burst=5 nodelay;
            
            proxy_pass http://api_backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # AI endpoints
        location /ai/ {
            limit_req zone=ai burst=10 nodelay;
            
            proxy_pass http://ai_backend/api/ai/;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            
            proxy_connect_timeout 5s;
            proxy_send_timeout 120s;
            proxy_read_timeout 120s;
        }

        # Health checks
        location /health {
            access_log off;
            proxy_pass http://api_backend/health;
            proxy_connect_timeout 1s;
            proxy_send_timeout 1s;
            proxy_read_timeout 1s;
        }
        
        # Block access to sensitive files
        location ~ /\. {
            deny all;
        }
        
        location ~ \.(sql|conf|env)$ {
            deny all;
        }
    }
}
```

### 4. Deploy to Production

```bash
# 1. Clone repository on production server
git clone https://github.com/your-org/rwa-dex-backend.git
cd rwa-dex-backend

# 2. Set up environment
cp .env.example .env.prod
# Edit .env.prod with production values

# 3. Deploy with Docker Compose
docker-compose -f docker-compose.prod.yml up -d

# 4. Check deployment
docker-compose -f docker-compose.prod.yml ps
docker-compose -f docker-compose.prod.yml logs -f
```

## ☁️ Cloud Deployment

### AWS Deployment with ECS

1. **Create ECS Cluster**
```bash
aws ecs create-cluster --cluster-name rwa-dex-cluster
```

2. **Create Task Definitions**

Create `ecs-task-definition.json`:
```json
{
  "family": "rwa-dex-api",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "1024",
  "memory": "2048",
  "executionRoleArn": "arn:aws:iam::YOUR_ACCOUNT:role/ecsTaskExecutionRole",
  "containerDefinitions": [
    {
      "name": "api",
      "image": "your-ecr-repo/rwa-dex-api:latest",
      "portMappings": [
        {
          "containerPort": 5000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        }
      ],
      "secrets": [
        {
          "name": "DATABASE_URL",
          "valueFrom": "arn:aws:ssm:region:account:parameter/rwa-dex/database-url"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/rwa-dex",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "api"
        }
      }
    }
  ]
}
```

3. **Create ECS Service**
```bash
aws ecs create-service \
  --cluster rwa-dex-cluster \
  --service-name rwa-dex-api \
  --task-definition rwa-dex-api:1 \
  --desired-count 3 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-12345],securityGroups=[sg-12345],assignPublicIp=ENABLED}"
```

### Google Cloud Platform Deployment

1. **Deploy to Cloud Run**
```bash
# Build and push container
gcloud builds submit --tag gcr.io/PROJECT_ID/rwa-dex-api

# Deploy to Cloud Run
gcloud run deploy rwa-dex-api \
  --image gcr.io/PROJECT_ID/rwa-dex-api \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars NODE_ENV=production \
  --memory 2Gi \
  --cpu 2
```

### Azure Container Instances

```bash
# Create resource group
az group create --name rwa-dex-rg --location eastus

# Deploy container group
az container create \
  --resource-group rwa-dex-rg \
  --name rwa-dex-api \
  --image your-registry/rwa-dex-api:latest \
  --cpu 2 \
  --memory 4 \
  --ports 5000 \
  --environment-variables NODE_ENV=production \
  --secure-environment-variables DATABASE_URL=$DATABASE_URL
```

## 🔒 Security Configuration

### 1. SSL/TLS Setup

```bash
# Using Let's Encrypt with Certbot
sudo apt update
sudo apt install certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Auto-renewal
echo "0 12 * * * /usr/bin/certbot renew --quiet" | sudo crontab -
```

### 2. Firewall Configuration

```bash
# UFW (Ubuntu Firewall)
sudo ufw enable
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw deny 5000/tcp  # Block direct API access
sudo ufw deny 8001/tcp  # Block direct AI engine access
```

### 3. Security Headers

Add to Nginx configuration:
```nginx
# CORS for API
add_header Access-Control-Allow-Origin "https://your-frontend-domain.com" always;
add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
add_header Access-Control-Allow-Headers "Origin, X-Requested-With, Content-Type, Accept, Authorization" always;

# Security headers
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';" always;
add_header X-Frame-Options DENY always;
add_header X-Content-Type-Options nosniff always;
```

## 📊 Monitoring Setup

### 1. Prometheus Configuration

Create `prometheus/prometheus.yml`:
```yaml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'rwa-dex-api'
    static_configs:
      - targets: ['api:5000']
    metrics_path: '/metrics'
    
  - job_name: 'rwa-dex-ai'
    static_configs:
      - targets: ['ai-engine:8001']
    metrics_path: '/metrics'
    
  - job_name: 'postgres'
    static_configs:
      - targets: ['postgres:5432']
    
  - job_name: 'redis'
    static_configs:
      - targets: ['redis:6379']
```

### 2. Grafana Dashboards

Create monitoring dashboard for:
- API response times
- Database performance
- Cache hit rates
- Error rates
- Business metrics (trades, volume, users)

### 3. Logging with ELK Stack

```yaml
# Add to docker-compose.prod.yml
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.5.0
    environment:
      - discovery.type=single-node
      - "ES_JAVA_OPTS=-Xms1g -Xmx1g"
    volumes:
      - elasticsearch_data:/usr/share/elasticsearch/data

  logstash:
    image: docker.elastic.co/logstash/logstash:8.5.0
    volumes:
      - ./logstash/pipeline:/usr/share/logstash/pipeline
    depends_on:
      - elasticsearch

  kibana:
    image: docker.elastic.co/kibana/kibana:8.5.0
    environment:
      ELASTICSEARCH_HOSTS: http://elasticsearch:9200
    ports:
      - "5601:5601"
```

## 🚀 CI/CD Pipeline

### GitHub Actions

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Docker Buildx
      uses: docker/setup-buildx-action@v2
      
    - name: Login to Container Registry
      uses: docker/login-action@v2
      with:
        registry: ghcr.io
        username: ${{ github.actor }}
        password: ${{ secrets.GITHUB_TOKEN }}
        
    - name: Build and push API
      uses: docker/build-push-action@v3
      with:
        context: ./api
        push: true
        tags: ghcr.io/${{ github.repository }}/api:latest
        
    - name: Build and push AI Engine
      uses: docker/build-push-action@v3
      with:
        context: ./ai-engine
        push: true
        tags: ghcr.io/${{ github.repository }}/ai-engine:latest
        
    - name: Deploy to production
      uses: appleboy/ssh-action@master
      with:
        host: ${{ secrets.HOST }}
        username: ${{ secrets.USERNAME }}
        key: ${{ secrets.SSH_KEY }}
        script: |
          cd /opt/rwa-dex
          git pull origin main
          docker-compose -f docker-compose.prod.yml pull
          docker-compose -f docker-compose.prod.yml up -d
          docker system prune -f
```

## 🔧 Database Migration

### Setup Database Schema

```sql
-- Create production database
CREATE DATABASE rwa_dex_prod;
CREATE USER rwa_dex_user WITH ENCRYPTED PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE rwa_dex_prod TO rwa_dex_user;

-- Connect to database and create tables
\c rwa_dex_prod;

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_address VARCHAR(42) UNIQUE NOT NULL,
    kyc_status VARCHAR(20) DEFAULT 'pending',
    kyc_level VARCHAR(20) DEFAULT 'basic',
    jurisdiction VARCHAR(10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Assets table
CREATE TABLE assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token_address VARCHAR(42) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    symbol VARCHAR(20) NOT NULL,
    asset_type VARCHAR(20) NOT NULL,
    total_value DECIMAL(20,2),
    yield_rate INTEGER,
    maturity_date TIMESTAMP,
    jurisdiction VARCHAR(10),
    metadata JSONB,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Transactions table
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tx_hash VARCHAR(66) UNIQUE NOT NULL,
    from_address VARCHAR(42),
    to_address VARCHAR(42),
    asset_address VARCHAR(42),
    type VARCHAR(20) NOT NULL,
    amount DECIMAL(30,18),
    value_usd DECIMAL(20,2),
    timestamp TIMESTAMP NOT NULL,
    block_number BIGINT,
    status VARCHAR(20) DEFAULT 'pending'
);

-- Price history table
CREATE TABLE price_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_address VARCHAR(42) NOT NULL,
    price DECIMAL(30,18) NOT NULL,
    timestamp TIMESTAMP NOT NULL,
    source VARCHAR(20) NOT NULL
);

-- Indexes for performance
CREATE INDEX idx_users_wallet ON users(wallet_address);
CREATE INDEX idx_assets_token ON assets(token_address);
CREATE INDEX idx_transactions_hash ON transactions(tx_hash);
CREATE INDEX idx_transactions_timestamp ON transactions(timestamp);
CREATE INDEX idx_price_history_asset_time ON price_history(asset_address, timestamp);
```

## 📈 Scaling Considerations

### Horizontal Scaling

1. **API Scaling**
   - Multiple API instances behind load balancer
   - Stateless design with JWT tokens
   - Redis for shared session storage

2. **Database Scaling**
   - Read replicas for analytics queries
   - Connection pooling
   - Database sharding for high volume

3. **AI Engine Scaling**
   - Multiple AI instances
   - Model caching with Redis
   - Async processing with message queues

### Performance Optimization

1. **Database Optimization**
   ```sql
   -- Add database indexes
   CREATE INDEX CONCURRENTLY idx_transactions_user_type 
   ON transactions(from_address, type, timestamp);
   
   -- Partition large tables
   CREATE TABLE price_history_2025 
   PARTITION OF price_history 
   FOR VALUES FROM ('2025-01-01') TO ('2026-01-01');
   ```

2. **Caching Strategy**
   ```javascript
   // Implement cache layers
   const cacheKeys = {
     asset: (address) => `asset:${address}`,
     portfolio: (address) => `portfolio:${address}`,
     prices: () => 'prices:all'
   };
   ```

## 🆘 Troubleshooting

### Common Issues

1. **High Memory Usage**
   ```bash
   # Check memory usage
   docker stats
   
   # Restart services if needed
   docker-compose restart api ai-engine
   ```

2. **Database Connection Issues**
   ```bash
   # Check database connectivity
   docker-compose exec postgres psql -U $DB_USER -d $DB_NAME -c "SELECT 1;"
   
   # Check connection pool
   docker-compose logs api | grep "database"
   ```

3. **SSL Certificate Issues**
   ```bash
   # Check certificate expiry
   sudo certbot certificates
   
   # Renew certificates
   sudo certbot renew --dry-run
   ```

### Health Checks

```bash
# API health check
curl https://your-domain.com/health

# Database health
docker-compose exec postgres pg_isready

# Redis health
docker-compose exec redis redis-cli ping
```

## 🔄 Backup & Recovery

### Database Backup

```bash
# Create backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups"

# Create database backup
docker-compose exec -T postgres pg_dump -U $DB_USER -d $DB_NAME > $BACKUP_DIR/db_backup_$DATE.sql

# Compress backup
gzip $BACKUP_DIR/db_backup_$DATE.sql

# Upload to S3 (optional)
aws s3 cp $BACKUP_DIR/db_backup_$DATE.sql.gz s3://your-backup-bucket/
```

### Automated Backups

```bash
# Add to crontab
0 2 * * * /opt/rwa-dex/scripts/backup.sh
```

This completes the comprehensive deployment guide. The system is now ready for production deployment with proper security, monitoring, and scaling capabilities.