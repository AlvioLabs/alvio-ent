from celery import Celery

import alvio.background.celery.apps.app_base as app_base

celery_app = Celery(__name__)
celery_app.config_from_object("alvio.background.celery.configs.client")
celery_app.Task = app_base.TenantAwareTask  # type: ignore [misc]
