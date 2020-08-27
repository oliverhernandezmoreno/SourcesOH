from django.apps import AppConfig
from health_check.plugins import plugin_dir


class BaseConfig(AppConfig):
    name = 'base'

    def ready(self):
        from django.conf import settings
        from base.healthchecks import RedisBackend
        from base.healthchecks import ElasticsearchBackend
        from base.healthchecks import rabbitmq_backend_factory
        from base.healthchecks import storage_backend_factory
        plugin_dir.register(RedisBackend)
        plugin_dir.register(ElasticsearchBackend)
        plugin_dir.register(rabbitmq_backend_factory(
            "LocalRabbitMQBackend",
            settings.BROKER_URL,
            settings.AMQP_SSL,
        ))
        if settings.STORAGE_IS_S3:
            plugin_dir.register(storage_backend_factory(
                "LocalStorageBackend",
                settings.AWS_ACCESS_KEY_ID,
                settings.AWS_SECRET_ACCESS_KEY,
                settings.AWS_STORAGE_BUCKET_NAME,
                settings.AWS_S3_ENDPOINT_URL
            ))
        if settings.STACK_IS_SML:
            plugin_dir.register(rabbitmq_backend_factory(
                "SMCRabbitMQBackend",
                settings.SMC_BROKER_URL,
                settings.SMC_AMQP_SSL,
            ))
            plugin_dir.register(storage_backend_factory(
                "SMCStorageBackend",
                settings.SMC_S3_ACCESS_KEY_ID,
                settings.SMC_S3_SECRET_ACCESS_KEY,
                settings.SMC_S3_BUCKET_NAME,
                settings.SMC_S3_ENDPOINT_URL,
            ))
