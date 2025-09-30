from datetime import datetime

from alvio.configs.constants import AlvioCeleryTask


QUERY_HISTORY_TASK_NAME_PREFIX = AlvioCeleryTask.EXPORT_QUERY_HISTORY_TASK


def name_chat_ttl_task(
    retention_limit_days: float, tenant_id: str | None = None
) -> str:
    return f"chat_ttl_{retention_limit_days}_days"


def query_history_task_name(start: datetime, end: datetime) -> str:
    return f"{QUERY_HISTORY_TASK_NAME_PREFIX}_{start}_{end}"
