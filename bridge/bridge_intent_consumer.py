#!/usr/bin/env python3
"""
Bridge Intent Consumer v1
- Reads booking_interest events from oram_intent_queue.jsonl
- Processes each event once (offset-based)
- Logs routing decisions (no side effects)
"""

import json
import os
import time

# ---------------------------------------------------------------------
# PATHS (Render-safe; adjust only if repo layout changes)
# ---------------------------------------------------------------------

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "..", "data")
QUEUE_PATH = os.path.join(DATA_DIR, "oram_intent_queue.jsonl")
OFFSET_PATH = os.path.join(DATA_DIR, "oram_intent_consumer.offset")

POLL_INTERVAL_SECONDS = 2.0

# ---------------------------------------------------------------------
# UTILITIES
# ---------------------------------------------------------------------

def ensure_paths():
    os.makedirs(DATA_DIR, exist_ok=True)
    if not os.path.exists(QUEUE_PATH):
        open(QUEUE_PATH, "a").close()
    if not os.path.exists(OFFSET_PATH):
        with open(OFFSET_PATH, "w") as f:
            f.write("0")

def load_offset():
    try:
        with open(OFFSET_PATH, "r") as f:
            return int(f.read().strip() or 0)
    except:
        return 0

def save_offset(value):
    with open(OFFSET_PATH, "w") as f:
        f.write(str(value))

# ---------------------------------------------------------------------
# ROUTING LOGIC (v1 — LOG ONLY)
# ---------------------------------------------------------------------

def route_event(evt):
    if evt.get("event") == "booking_interest":
        artist = evt.get("artist")
        date = evt.get("date")
        context = evt.get("context")

        # Intended routing (LOG ONLY)
        print(f"[CONSUMER] booking_interest → KAIROS | {artist} ({date}) | context={context}")
        print(f"[CONSUMER] audit → SEVER")
        print(f"[CONSUMER] promotion_candidate → LUMENA")

    else:
        print(f"[CONSUMER] unknown event type: {evt.get('event')}")

# ---------------------------------------------------------------------
# MAIN LOOP
# ---------------------------------------------------------------------

def main():
    print("[CONSUMER] Bridge Intent Consumer starting")
    ensure_paths()

    while True:
        try:
            offset = load_offset()
            with open(QUEUE_PATH, "r") as f:
                lines = f.readlines()

            if offset < len(lines):
                new_lines = lines[offset:]
                for line in new_lines:
                    line = line.strip()
                    if not line:
                        offset += 1
                        continue

                    try:
                        evt = json.loads(line)
                        route_event(evt)
                    except Exception as e:
                        print("[CONSUMER] JSON parse error:", e)

                    offset += 1

                save_offset(offset)

        except Exception as e:
            print("[CONSUMER] error:", e)

        time.sleep(POLL_INTERVAL_SECONDS)

if __name__ == "__main__":
    main()
