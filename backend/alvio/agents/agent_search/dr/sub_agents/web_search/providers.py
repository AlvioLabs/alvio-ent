from alvio.agents.agent_search.dr.sub_agents.web_search.clients.exa_client import (
    ExaClient,
)
from alvio.agents.agent_search.dr.sub_agents.web_search.models import (
    InternetSearchProvider,
)
from alvio.configs.chat_configs import EXA_API_KEY


def get_default_provider() -> InternetSearchProvider | None:
    if EXA_API_KEY:
        return ExaClient()
    return None
