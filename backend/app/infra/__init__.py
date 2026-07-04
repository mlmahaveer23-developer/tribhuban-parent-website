"""
Infrastructure package — database, cache, storage, email, telemetry, outbox.

Public surface:
  from app.infra.db     import Base, engine, AsyncSessionLocal, get_db_session
  from app.infra.cache  import RedisClient, get_redis
  from app.infra.outbox import write_outbox_event
"""

from app.infra.outbox import write_outbox_event

__all__ = ["write_outbox_event"]
