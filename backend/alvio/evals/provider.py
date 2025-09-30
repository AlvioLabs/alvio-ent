from alvio.evals.models import EvalProvider
from alvio.evals.providers.braintrust import BraintrustEvalProvider


def get_default_provider() -> EvalProvider:
    return BraintrustEvalProvider()
