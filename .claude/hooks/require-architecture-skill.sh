#!/bin/bash
# Blocks Edit/Write tool calls unless the mynanny-architecture skill
# has been invoked via the Skill tool in the current session.
#
# Reads the transcript JSONL from stdin's transcript_path field.
# Exit 0 + deny JSON = block with reason shown to Claude.
# Exit 0 + allow JSON = permit the tool call.

INPUT=$(cat)
TRANSCRIPT_PATH=$(echo "$INPUT" | jq -r '.transcript_path // empty')

# If no transcript available, allow (shouldn't happen in practice)
if [ -z "$TRANSCRIPT_PATH" ] || [ ! -f "$TRANSCRIPT_PATH" ]; then
  exit 0
fi

# Check for a Skill tool call with "mynanny-architecture" in the transcript.
# The JSONL transcript records tool calls as JSON objects. A Skill invocation
# will have both "Skill" (the tool name) and "mynanny-architecture" (the skill
# parameter) on the same line or in adjacent lines. We check for both strings
# appearing together on the same JSONL line to avoid false positives from
# casual mentions in conversation text.
if grep '"Skill"' "$TRANSCRIPT_PATH" 2>/dev/null | grep -q '"mynanny-architecture"'; then
  cat << 'EOF'
{
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "permissionDecision": "allow"
  }
}
EOF
  exit 0
fi

# Skill was NOT invoked — block the tool call
cat << 'EOF'
{
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "permissionDecision": "deny",
    "permissionDecisionReason": "You MUST invoke the mynanny-architecture skill (via the Skill tool) before making any code changes. Run it now, then retry your edit."
  }
}
EOF
exit 0
