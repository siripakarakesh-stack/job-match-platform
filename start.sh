#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║       CareerAI - Project Launcher          ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════╝${NC}"
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo -e "${YELLOW}⚠️  .env.local not found!${NC}"
    echo ""
    echo -e "${YELLOW}Creating .env.local from .env.local.example...${NC}"
    if [ -f .env.local.example ]; then
        cp .env.local.example .env.local
        echo -e "${GREEN}✓ Created .env.local${NC}"
        echo ""
        echo -e "${YELLOW}Please update .env.local with your credentials:${NC}"
        echo ""
        cat .env.local | grep "NEXT_PUBLIC_\|SUPABASE_\|N8N_\|APP_URL"
        echo ""
        echo -e "${YELLOW}Then run the script again.${NC}"
        exit 1
    else
        echo -e "${RED}✗ .env.local.example not found!${NC}"
        exit 1
    fi
fi

echo -e "${BLUE}📋 Checking dependencies...${NC}"

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}✗ Node.js is not installed${NC}"
    echo -e "${YELLOW}Please install Node.js from https://nodejs.org${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Node.js $(node -v)${NC}"

# Check npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}✗ npm is not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✓ npm $(npm -v)${NC}"

echo ""
echo -e "${BLUE}📦 Installing dependencies...${NC}"

# Install dependencies
if [ ! -d "node_modules" ]; then
    npm install
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Dependencies installed${NC}"
    else
        echo -e "${RED}✗ Failed to install dependencies${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✓ Dependencies already installed${NC}"
fi

echo ""
echo -e "${BLUE}🔍 Validating environment variables...${NC}"

# Check required env vars
REQUIRED_VARS=("NEXT_PUBLIC_SUPABASE_URL" "NEXT_PUBLIC_SUPABASE_ANON_KEY" "SUPABASE_SERVICE_ROLE_KEY" "N8N_WEBHOOK_URL")
MISSING_VARS=()

for var in "${REQUIRED_VARS[@]}"; do
    value=$(grep "^${var}=" .env.local | cut -d '=' -f 2-)
    if [ -z "$value" ] || [ "$value" = "your_value_here" ] || [ "$value" = "" ]; then
        MISSING_VARS+=("$var")
    fi
done

if [ ${#MISSING_VARS[@]} -ne 0 ]; then
    echo -e "${YELLOW}⚠️  Missing or incomplete environment variables:${NC}"
    for var in "${MISSING_VARS[@]}"; do
        echo -e "${RED}   • $var${NC}"
    done
    echo ""
    echo -e "${YELLOW}Please update .env.local with your actual values:${NC}"
    echo -e "  1. NEXT_PUBLIC_SUPABASE_URL - Your Supabase project URL"
    echo -e "  2. NEXT_PUBLIC_SUPABASE_ANON_KEY - Your Supabase anonymous key"
    echo -e "  3. SUPABASE_SERVICE_ROLE_KEY - Your Supabase service role key"
    echo -e "  4. N8N_WEBHOOK_URL - Your n8n webhook URL for job matching"
    echo ""
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
else
    echo -e "${GREEN}✓ All required environment variables configured${NC}"
fi

echo ""
echo -e "${BLUE}🚀 Starting application...${NC}"
echo ""
echo -e "${GREEN}═══════════════════════════════════════════${NC}"
echo -e "${GREEN}  Application will be available at:${NC}"
echo -e "${GREEN}  🌐 http://localhost:3000${NC}"
echo -e "${GREEN}═══════════════════════════════════════════${NC}"
echo ""

# Start the development server
npm run dev
