from fastapi import APIRouter
from fastapi import Depends

from ee.alvio.server.tenants.models import TenantByDomainResponse
from ee.alvio.server.tenants.provisioning import get_tenant_by_domain_from_control_plane
from alvio.auth.users import current_user
from alvio.auth.users import User
from alvio.utils.logger import setup_logger
from shared_configs.contextvars import get_current_tenant_id

logger = setup_logger()

router = APIRouter(prefix="/tenants")

FORBIDDEN_COMMON_EMAIL_SUBSTRINGS = [
    "gmail",
    "outlook",
    "yahoo",
    "hotmail",
    "icloud",
    "msn",
    "hotmail",
    "hotmail.co.uk",
]


@router.get("/existing-team-by-domain")
def get_existing_tenant_by_domain(
    user: User | None = Depends(current_user),
) -> TenantByDomainResponse | None:
    if not user:
        return None
    domain = user.email.split("@")[1]
    if any(substring in domain for substring in FORBIDDEN_COMMON_EMAIL_SUBSTRINGS):
        return None

    tenant_id = get_current_tenant_id()

    return get_tenant_by_domain_from_control_plane(domain, tenant_id)
