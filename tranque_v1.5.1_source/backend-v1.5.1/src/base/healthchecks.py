from django.conf import settings
from health_check.backends import BaseHealthCheckBackend
from health_check.exceptions import HealthCheckException


class RedisBackend(BaseHealthCheckBackend):

    critical_service = False

    def check_status(self):
        import redis
        try:
            redis.Redis(**settings.CACHEOPS_REDIS).info()
        except Exception:
            raise HealthCheckException("redis service is unavailable")

    def identifier(self):
        return self.__class__.__name__


class ElasticsearchBackend(BaseHealthCheckBackend):

    critical_service = True

    def check_status(self):
        from targets.elastic import connect
        try:
            connect().info()
        except Exception:
            raise HealthCheckException("elasticsearch service is unavailable")

    def identifier(self):
        return self.__class__.__name__


def rabbitmq_backend_factory(name, broker_url, ssl):
    def check_status(self):
        import kombu
        try:
            with kombu.Connection(broker_url, ssl=ssl) as conn:
                conn.ensure_connection(max_retries=0)
        except Exception:
            raise HealthCheckException("rabbitmq service is unavailable")

    def identifier(self):
        return name

    return type(
        name,
        (BaseHealthCheckBackend,),
        {
            "critical_service": True,
            "check_status": check_status,
            "identifier": identifier,
        },
    )


def storage_backend_factory(name, access_key_id, secret_access_key, bucket_name, endpoint_url):
    def check_status(self):
        import boto3
        try:
            client = boto3.client(
                "s3",
                aws_access_key_id=access_key_id,
                aws_secret_access_key=secret_access_key,
                endpoint_url=endpoint_url,
            )
            client.list_objects(Bucket=bucket_name)
        except Exception:
            raise HealthCheckException("storage service is unavailable")

    def identifier(self):
        return name

    return type(
        name,
        (BaseHealthCheckBackend,),
        {
            "critical_service": True,
            "check_status": check_status,
            "identifier": identifier,
        },
    )
