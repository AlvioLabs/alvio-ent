from langchain_core.messages import BaseMessage
from pydantic import BaseModel

from alvio.llm.models import PreviousMessage


class PromptSnapshot(BaseModel):
    raw_message_history: list[PreviousMessage]
    raw_user_query: str
    built_prompt: list[BaseMessage]
