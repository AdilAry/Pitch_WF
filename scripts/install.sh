#!/usr/bin/env bash
# Install the Pitch_WF kit (Linux and macOS). Draft, not run yet.
#     bash scripts/install.sh [--copy]
# Needs the short-loop workflow installed first: its install.sh sets WORKFLOW_DIR.
# Links the kit's commands next to the workflow's, through the workflow's own installer,
# and saves this folder as PITCH_WF in ~/.bashrc.
set -euo pipefail

KIT="$(cd "$(dirname "$(readlink -f "${BASH_SOURCE[0]}")")/.." && pwd)"
if [[ -z "${WORKFLOW_DIR:-}" || ! -f "$WORKFLOW_DIR/install.sh" ]]; then
  echo "WORKFLOW_DIR is not set, or is not the workflow folder: '${WORKFLOW_DIR:-}'." >&2
  echo "Install the short-loop workflow first (bash <workflow>/install.sh), open a new terminal, then run this again." >&2
  exit 1
fi

bash "$WORKFLOW_DIR/install.sh" "$@" "$KIT/commands"

RC="$HOME/.bashrc"
LINE="export PITCH_WF=\"$KIT\""
if ! grep -qxF "$LINE" "$RC" 2>/dev/null; then
  if grep -q '^export PITCH_WF=' "$RC" 2>/dev/null; then
    TMP="$(mktemp)"; grep -v '^export PITCH_WF=' "$RC" > "$TMP" || true; cat "$TMP" > "$RC"; rm -f "$TMP"
  fi
  echo "$LINE" >> "$RC"
  echo "Saved PITCH_WF=$KIT in ~/.bashrc (open a new terminal to use it)"
fi
