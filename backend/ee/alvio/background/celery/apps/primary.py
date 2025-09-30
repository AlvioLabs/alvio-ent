from alvio.background.celery.apps.primary import celery_app


celery_app.autodiscover_tasks(
    [
        "ee.alvio.background.celery.tasks.doc_permission_syncing",
        "ee.alvio.background.celery.tasks.external_group_syncing",
        "ee.alvio.background.celery.tasks.cloud",
        "ee.alvio.background.celery.tasks.ttl_management",
        "ee.alvio.background.celery.tasks.usage_reporting",
    ]
)
