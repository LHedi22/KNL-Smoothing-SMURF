from typing import Any, Optional
from core.config import settings

try:
    import redis
except Exception:  # redis not installed
    redis = None

def get_cache() -> Optional[Any]:
    """
    Return a Redis client when REDIS_ENABLED is True.
    Raises RuntimeError if Redis is enabled but the `redis` package is missing
    or a connection cannot be established.
    """
    if not settings.REDIS_ENABLED:
        return None

    if redis is None:
        raise RuntimeError("Redis is enabled but the 'redis' package is not installed.")

    client = redis.Redis.from_url(settings.REDIS_URL, decode_responses=True)
    try:
        client.ping()
    except Exception as e:
        raise RuntimeError(f"Unable to connect to Redis at {settings.REDIS_URL}: {e}")

    return client