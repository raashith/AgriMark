import time
from collections import defaultdict, deque
from threading import Lock

from fastapi import Request

WINDOW_SECONDS = 60
DEFAULT_LIMIT = 120
AUTH_LIMIT = 12
AI_LIMIT = 20
WRITE_LIMIT = 60
MAX_BUCKETS = 10_000

_buckets: dict[str, deque[float]] = defaultdict(deque)
_lock = Lock()


def _client_key(request: Request) -> str:
    # Uvicorn/Render should normalize trusted proxy headers before the app sees them.
    # Never use a raw, caller-controlled X-Forwarded-For value as the identity.
    return request.client.host if request.client and request.client.host else "unknown"


def _limit_for(request: Request) -> int:
    path = request.url.path
    if path.startswith("/api/v1/auth/"):
        return AUTH_LIMIT
    if path.startswith("/api/v1/ai/"):
        return AI_LIMIT
    if request.method in {"POST", "PUT", "PATCH", "DELETE"}:
        return WRITE_LIMIT
    return DEFAULT_LIMIT


def check_rate_limit(request: Request) -> tuple[bool, int, int, int]:
    now = time.monotonic()
    limit = _limit_for(request)
    key = f"{_client_key(request)}:{request.method}:{request.url.path}"

    with _lock:
        bucket = _buckets[key]
        cutoff = now - WINDOW_SECONDS
        while bucket and bucket[0] <= cutoff:
            bucket.popleft()

        current = len(bucket)
        if current >= limit:
            retry_after = max(1, int(WINDOW_SECONDS - (now - bucket[0])))
            return True, limit, current, retry_after

        bucket.append(now)

        # Keep stale/unused buckets bounded in a single-instance deployment.
        if len(_buckets) > MAX_BUCKETS:
            stale_keys = [k for k, v in _buckets.items() if not v]
            for stale_key in stale_keys[: max(1, len(stale_keys) - MAX_BUCKETS // 2)]:
                _buckets.pop(stale_key, None)

        return False, limit, current + 1, 0
