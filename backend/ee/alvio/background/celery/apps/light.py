from alvio.background.celery.apps.light import celery_app

celery_app.autodiscover_tasks(
    [
        "ee.alvio.background.celery.tasks.doc_permission_syncing",
        "ee.alvio.background.celery.tasks.external_group_syncing",
    ]
)
