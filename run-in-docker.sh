#!/bin/bash

# Colors
BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   CareerAI - Docker Container Launcher     ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════╝${NC}"
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}✗ Docker is not installed${NC}"
    echo -e "${YELLOW}Please install Docker from https://docker.com${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Docker $(docker --version)${NC}"

if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}✗ Docker Compose is not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Docker Compose $(docker-compose --version)${NC}"

echo ""
echo -e "${BLUE}📋 Checking .env.local...${NC}"

if [ ! -f .env.local ]; then
    echo -e "${YELLOW}Creating .env.local...${NC}"
    cp .env.local.example .env.local
    echo -e "${YELLOW}Please update .env.local with your credentials${NC}"
    exit 1
fi

echo -e "${GREEN}✓ .env.local found${NC}"
echo ""
echo -e "${BLUE}🐳 Building and starting Docker containers...${NC}"
echo ""

docker-compose up --build
