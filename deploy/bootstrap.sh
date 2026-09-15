#!/usr/bin/env bash
# Remote bootstrap — run on VPS as root
set -euo pipefail

export DEBIAN_FRONTEND=noninteractive

if ! command -v docker >/dev/null 2>&1; then
  apt-get update -qq
  apt-get install -y -qq docker.io docker-compose-v2 git curl ca-certificates
  systemctl enable --now docker
fi

if ! swapon --show | grep -q .; then
  fallocate -l 2G /swapfile || dd if=/dev/zero of=/swapfile bs=1M count=2048
  chmod 600 /swapfile
  mkswap /swapfile
  swapon /swapfile
  grep -q '/swapfile' /etc/fstab || echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi

mkdir -p /opt/booking-agency
cd /opt/booking-agency

if [ ! -f .env.prod ]; then
  PG_PASS=$(openssl rand -hex 16)
  SECRET=$(openssl rand -hex 32)
  cat > .env.prod <<EOF
POSTGRES_USER=booking
POSTGRES_PASSWORD=${PG_PASS}
POSTGRES_DB=booking
SECRET_KEY=${SECRET}
ACCESS_TOKEN_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_DAYS=7
CORS_ORIGINS=http://189.74.98.199,http://vps11877.eskiz.uz
COOKIE_SECURE=false
NEXT_PUBLIC_API_URL=
EOF
  chmod 600 .env.prod
fi

docker compose --env-file .env.prod -f docker-compose.prod.yml up -d --build
docker compose --env-file .env.prod -f docker-compose.prod.yml ps
curl -sf http://127.0.0.1/health || true
echo DEPLOY_DONE
