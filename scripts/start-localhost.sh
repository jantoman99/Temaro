#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

echo
echo "Spoustim rezervacni system..."
echo
echo "Po nacteni otevri v prohlizeci:"
echo "http://localhost:3000"
echo
echo "Pro vypnuti stiskni Ctrl+C."
echo

npm run dev
