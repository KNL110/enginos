#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
FRONTEND_DIR="$ROOT_DIR/portfolio"
CONTROL_PANEL_DIR="$ROOT_DIR/control_panel"
PREFIX="$ROOT_DIR/scripts/_prefix.sh"

BLUE=$'\033[1;34m'
GREEN=$'\033[1;32m'
MAGENTA=$'\033[1;35m'

PIDS=()
CLEANED_UP=0

cleanup() {
    [ "$CLEANED_UP" = 1 ] && return
    CLEANED_UP=1
    echo ""
    echo "Stopping backend, frontend, and control panel..."
    for pid in "${PIDS[@]}"; do
        kill -TERM -- "-$pid" 2>/dev/null || true
    done
    wait 2>/dev/null || true
}
trap cleanup EXIT INT TERM

# Each service is launched via setsid so it (and every child process it
# spawns, e.g. npm -> node -> next-server) lives in its own process group.
# That lets cleanup() kill the whole tree instead of leaving orphans
# holding onto ports after this script exits.
start() {
    setsid "$@" &
    PIDS+=("$!")
}

echo "Starting backend (Express)..."
# constants.ts/db.ts load backend/.env themselves via dotenv, so this
# script doesn't need to source it.
start bash -c "cd '$BACKEND_DIR' && npm run dev 2>&1 | '$PREFIX' BACKEND '$BLUE'"

echo "Starting frontend (Next.js, bound to 0.0.0.0:3000)..."
start bash -c "cd '$FRONTEND_DIR' && npm run dev 2>&1 | '$PREFIX' FRONTEND '$GREEN'"

echo "Starting control panel (Next.js, bound to 0.0.0.0:3001)..."
start bash -c "cd '$CONTROL_PANEL_DIR' && npx next dev -H 0.0.0.0 -p 3001 2>&1 | '$PREFIX' CONTROL '$MAGENTA'"

LAN_IP="$(hostname -I 2>/dev/null | awk '{print $1}')"

echo ""
echo "Backend:                  http://localhost:8080"
echo "Frontend:                 http://localhost:3000"
echo "Control panel:            http://localhost:3001"
if [ -n "$LAN_IP" ]; then
    echo "Frontend (network):       http://$LAN_IP:3000"
    echo "Control panel (network):  http://$LAN_IP:3001"
fi
echo ""
echo "Press Ctrl+C to stop all."

wait
