#!/usr/bin/env bash
# Build the remaining age-ladder athletes end to end, unattended.
#
# Follows README section 27 exactly, minus the human checkpoints — those become audits, and
# anything an audit rejects is left for review rather than silently accepted. Nothing is
# approved: `approve` is a human act, and the pack stays open until somebody looks.
set -u
LOG_DIR="${1:?pass a log directory}"
mkdir -p "$LOG_DIR"

for SLUG in soccer-age-32 soccer-age-22 soccer-age-50; do
  echo "=============================== $SLUG"
  # 1. the four before photos (skipped when they already exist and the prompt has not moved)
  npm run art:athlete -- --athlete "$SLUG" --stage snapshots       > "$LOG_DIR/$SLUG-1-snap.log"     2>&1
  grep -E "^  (ok|FAIL)" "$LOG_DIR/$SLUG-1-snap.log" || true

  # 2. intake — a rejection here is worth stopping for
  npm run art:intake -- --photos "art-pipeline/out/athletes/$SLUG/before" > "$LOG_DIR/$SLUG-2-intake.log" 2>&1
  tail -3 "$LOG_DIR/$SLUG-2-intake.log"

  # 3. freeze the decisions
  npm run art:spec -- --athlete "$SLUG"                            > "$LOG_DIR/$SLUG-3-spec.log"     2>&1
  grep -E "^  (photo|default|crest|ASK)" "$LOG_DIR/$SLUG-3-spec.log" || true

  # 4. wardrobe anchor, then identity anchor
  npm run art:athlete -- --athlete "$SLUG" --stage kit             > "$LOG_DIR/$SLUG-4-kit.log"      2>&1
  grep -E "^  (ok|FAIL)" "$LOG_DIR/$SLUG-4-kit.log" || true
  npm run art:athlete -- --athlete "$SLUG" --stage identity --from-photos auto > "$LOG_DIR/$SLUG-5-identity.log" 2>&1
  grep -E "^  (ok|FAIL)" "$LOG_DIR/$SLUG-5-identity.log" || true

  # 5. the four poses, one at a time so a failure is isolated to its own frame
  for POSE in hero action2 action3 back; do
    npm run art:athlete -- --athlete "$SLUG" --stage poses --pose "$POSE" > "$LOG_DIR/$SLUG-6-$POSE.log" 2>&1
    grep -E "^  (ok|FAIL)" "$LOG_DIR/$SLUG-6-$POSE.log" || true
  done

  # 6. the supports must mirror each other — measured, not requested
  npm run art:orient -- --athlete "$SLUG" --frame action3 --opposite-to action2 > "$LOG_DIR/$SLUG-7-orient.log" 2>&1
  grep -E "faces|already|mirrored" "$LOG_DIR/$SLUG-7-orient.log" || true

  # 7. audits: kit plate, then the set, then each frame. Nothing is re-rolled unattended —
  #    a re-roll is a fresh roll of the dice and there is nobody here to judge the result.
  npm run art:qa:athlete -- --athlete "$SLUG"                      > "$LOG_DIR/$SLUG-8-qa.log"       2>&1
  sed -n '/judge/,$p' "$LOG_DIR/$SLUG-8-qa.log" | grep -E "KIT|SET|PASS|FAIL|passed" || true

  # 8. the numeric identity gate
  npm run art:identity -- --athlete "$SLUG"                        > "$LOG_DIR/$SLUG-9-gate.log"     2>&1
  grep -E "cosine|mean|>>" "$LOG_DIR/$SLUG-9-gate.log" || true
  echo
done
echo "=============================== ladder complete"
