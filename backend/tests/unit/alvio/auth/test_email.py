import pytest

from alvio.auth.email_utils import build_user_email_invite
from alvio.auth.email_utils import send_email
from alvio.configs.constants import AuthType
from alvio.configs.constants import ALVIO_DEFAULT_APPLICATION_NAME
from alvio.db.engine.sql_engine import SqlEngine
from alvio.server.runtime.alvio_runtime import AlvioRuntime


@pytest.mark.skip(
    reason="This sends real emails, so only run when you really want to test this!"
)
def test_send_user_email_invite() -> None:
    SqlEngine.init_engine(pool_size=20, max_overflow=5)

    application_name = ALVIO_DEFAULT_APPLICATION_NAME

    alvio_file = AlvioRuntime.get_emailable_logo()

    subject = f"Invitation to Join {application_name} Organization"

    FROM_EMAIL = "noreply@alvio.io"
    TO_EMAIL = "support@alvio.io"
    text_content, html_content = build_user_email_invite(
        FROM_EMAIL, TO_EMAIL, ALVIO_DEFAULT_APPLICATION_NAME, AuthType.CLOUD
    )

    send_email(
        TO_EMAIL,
        subject,
        html_content,
        text_content,
        mail_from=FROM_EMAIL,
        inline_png=("logo.png", alvio_file.data),
    )
