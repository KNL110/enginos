#!/usr/bin/env bash
# Prefixes each line of stdin with a colored [LABEL] tag.
# Usage: some_command | _prefix.sh LABEL COLOR
set -euo pipefail

label="$1"
color="$2"
reset=$'\033[0m'

while IFS= read -r line; do
    printf '%s[%s]%s %s\n' "$color" "$label" "$reset" "$line"
done
