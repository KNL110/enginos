#!/bin/bash
# Runs both standalone Next.js servers side by side inside one container.
# Exits (and so takes the container down) the moment either one dies,
# instead of silently limping along with just one service up.
set -e

(cd /app/control_panel && PORT="${CONTROL_PANEL_PORT:-3001}" HOSTNAME=0.0.0.0 node server.js) &
CONTROL_PANEL_PID=$!

(cd /app/portfolio && PORT="${PORTFOLIO_PORT:-3000}" HOSTNAME=0.0.0.0 node server.js) &
PORTFOLIO_PID=$!

wait -n "$CONTROL_PANEL_PID" "$PORTFOLIO_PID"
exit $?
