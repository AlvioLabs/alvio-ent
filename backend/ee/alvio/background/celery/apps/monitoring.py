from alvio.background.celery.apps.monitoring import celery_app

celery_app.autodiscover_tasks(
    [
        "ee.alvio.background.celery.tasks.tenant_provisioning",
    ]
)
