#!/bin/bash

# AI Newsroom Assistant - Start Script
# =====================================

set -e

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$PROJECT_DIR"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${PURPLE}"
echo "  ╔═══════════════════════════════════════╗"
echo "  ║     AI NEWSROOM ASSISTANT             ║"
echo "  ║     Intelligence Platform             ║"
echo "  ╚═══════════════════════════════════════╝"
echo -e "${NC}"

# Load env
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

BACKEND_PORT=${BACKEND_PORT:-3001}
FRONTEND_PORT=${FRONTEND_PORT:-5173}

# Kill processes on used ports
echo -e "${YELLOW}Cleaning up used ports...${NC}"
for PORT in $BACKEND_PORT $FRONTEND_PORT; do
  PID=$(lsof -ti:$PORT 2>/dev/null || true)
  if [ -n "$PID" ]; then
    echo -e "  Killing process on port $PORT (PID: $PID)"
    kill -9 $PID 2>/dev/null || true
    sleep 1
  fi
done
echo -e "${GREEN}Ports cleaned.${NC}"

# Check PostgreSQL
echo -e "\n${YELLOW}Checking PostgreSQL...${NC}"
if ! command -v psql &> /dev/null; then
  echo -e "${RED}PostgreSQL not found. Please install PostgreSQL first.${NC}"
  exit 1
fi

if ! pg_isready -h ${DB_HOST:-localhost} -p ${DB_PORT:-5432} &>/dev/null; then
  echo -e "${RED}PostgreSQL is not running. Starting...${NC}"
  if command -v brew &> /dev/null; then
    brew services start postgresql@14 2>/dev/null || brew services start postgresql 2>/dev/null || true
    sleep 2
  fi
fi

if pg_isready -h ${DB_HOST:-localhost} -p ${DB_PORT:-5432} &>/dev/null; then
  echo -e "${GREEN}PostgreSQL is running.${NC}"
else
  echo -e "${RED}Could not start PostgreSQL. Please start it manually.${NC}"
  exit 1
fi

# Create database if not exists
echo -e "\n${YELLOW}Setting up database...${NC}"
psql -h ${DB_HOST:-localhost} -p ${DB_PORT:-5432} -U ${DB_USER:-postgres} -tc "SELECT 1 FROM pg_database WHERE datname = '${DB_NAME:-ai_newsroom}'" 2>/dev/null | grep -q 1 || \
  createdb -h ${DB_HOST:-localhost} -p ${DB_PORT:-5432} -U ${DB_USER:-postgres} ${DB_NAME:-ai_newsroom} 2>/dev/null || true
echo -e "${GREEN}Database ready.${NC}"

# Install dependencies
echo -e "\n${YELLOW}Installing backend dependencies...${NC}"
cd "$PROJECT_DIR/backend"
npm install --silent 2>&1 | tail -1
echo -e "${GREEN}Backend dependencies installed.${NC}"

echo -e "\n${YELLOW}Installing frontend dependencies...${NC}"
cd "$PROJECT_DIR/frontend"
npm install --silent 2>&1 | tail -1
echo -e "${GREEN}Frontend dependencies installed.${NC}"

# Seed database
echo -e "\n${YELLOW}Seeding database...${NC}"
cd "$PROJECT_DIR/backend"
node src/seeds/seed.js
echo -e "${GREEN}Database seeded successfully.${NC}"

# Start backend with nodemon (hot reload)
echo -e "\n${CYAN}Starting backend on port ${BACKEND_PORT} (with hot reload)...${NC}"
cd "$PROJECT_DIR/backend"
npx nodemon src/server.js &
BACKEND_PID=$!

# Start frontend with Vite (hot reload)
echo -e "${CYAN}Starting frontend on port ${FRONTEND_PORT} (with hot reload)...${NC}"
cd "$PROJECT_DIR/frontend"
npx vite --port $FRONTEND_PORT &
FRONTEND_PID=$!

# Cleanup on exit
cleanup() {
  echo -e "\n${YELLOW}Shutting down...${NC}"
  kill $BACKEND_PID 2>/dev/null || true
  kill $FRONTEND_PID 2>/dev/null || true
  echo -e "${GREEN}Goodbye!${NC}"
  exit 0
}
trap cleanup SIGINT SIGTERM

echo -e "\n${GREEN}═══════════════════════════════════════${NC}"
echo -e "${GREEN}  Application is running!${NC}"
echo -e "${GREEN}═══════════════════════════════════════${NC}"
echo -e ""
echo -e "  ${BLUE}Frontend:${NC}  http://localhost:${FRONTEND_PORT}"
echo -e "  ${BLUE}Backend:${NC}   http://localhost:${BACKEND_PORT}"
echo -e ""
echo -e "  ${PURPLE}Login Credentials:${NC}"
echo -e "  Editor:   editor@newsroom.com / password123"
echo -e "  Reporter: reporter@newsroom.com / password123"
echo -e "  Admin:    admin@newsroom.com / password123"
echo -e ""
echo -e "  ${YELLOW}Press Ctrl+C to stop${NC}"
echo -e ""

# Wait for processes
wait
