"""Validate production data integration prerequisites without contacting providers."""
from __future__ import annotations

import os
import sys

REQUIRED_ENV = {
    "AGMARKNET_API_URL": "AGMARKNET/API endpoint",
    "IMD_API_URL": "IMD/API endpoint",
}

OPTIONAL_SECRET_GROUPS = {
    "AGMARKNET": ["AGMARKNET_API_KEY"],
    "IMD": ["IMD_API_KEY"],
}


def main() -> int:
    missing = []
    configured = []
    for key, label in REQUIRED_ENV.items():
        value = os.getenv(key)
        if value:
            configured.append(f"{label}: configured")
        else:
            missing.append(key)

    for line in configured:
        print(line)

    for provider, keys in OPTIONAL_SECRET_GROUPS.items():
        present = [k for k in keys if os.getenv(k)]
        print(f"{provider} credentials: {'configured' if present else 'not configured'}")

    if missing:
        print("Missing required integration endpoints:")
        for key in missing:
            print(f"- {key}")
        return 1

    print("Production integration prerequisites are configured.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
