"""
Django settings for backend project.

Generated by 'django-admin startproject' using Django 2.1.

For more information on this file, see
https://docs.djangoproject.com/en/2.1/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/2.1/ref/settings/
"""
import os
import secrets
import sys
from datetime import timedelta
from pathlib import Path

# Build paths inside the project like this: os.path.join(BASE_DIR, ...)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/2.1/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.environ.get("SECRET_KEY", "super-insecure-secret")

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = os.environ.get("DEBUG", "1") == "1"

TESTING = len(sys.argv) > 1 and sys.argv[1] == 'test'

TEST_RUNNER = 'api.tests.base.TestRunner'

ALLOWED_HOSTS = os.environ.get("ALLOWED_HOSTS", "*").split(",")

NAMESPACE = os.environ.get("NAMESPACE", "global-namespace")

PROFILES_BASE = (
    os.environ.get("PROFILES_BASE", os.path.join(BASE_DIR, "profiles"))
    if not TESTING
    else os.path.join(BASE_DIR, "test-profiles")
)
PROFILES_FORMAT = os.environ.get("PROFILES_FORMAT", "yml")

ALERT_MODULES_ROOT = os.environ.get("ALERT_MODULES_ROOT", os.path.join(BASE_DIR, "alerts", "modules"))

ENABLE_SILK_PROFILING = not TESTING and os.environ.get("ENABLE_REQUEST_PROFILING", "0" if not DEBUG else "1") == "1"
SILK_PYTHON_PROFILER = ENABLE_SILK_PROFILING and (os.environ.get("ENABLE_PYTHON_PROFILING", False) or False)

DAEMON = os.environ.get("DAEMON", "0") == "1"

# Application definition

INSTALLED_APPS = list(filter(bool, [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django.contrib.gis',
    'django_extensions' if DEBUG else None,
    'django_filters',
    'corsheaders',
    'guardian',
    'rest_framework',
    'rest_framework.authtoken',
    'raven.contrib.django.raven_compat',
    'reversion',
    'django_admin_json_editor',
    'health_check',
    'health_check.db',
    'health_check.contrib.psutil',
    'revproxy',
    'cacheops',
    'storages',
    'silk' if ENABLE_SILK_PROFILING else None,
    # project's apps
    'base',
    'entities',
    'documents',
    'targets',
    'alerts',
    'infos',
    'reportforms',
    'etl',
    'remotes',
]))

MIDDLEWARE = list(filter(bool, [
    'silk.middleware.SilkyMiddleware' if ENABLE_SILK_PROFILING else None,
    'django.middleware.security.SecurityMiddleware',
    'base.middleware.GetTokenMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'reversion.middleware.RevisionMiddleware',
    'base.middleware.log_query_count' if DEBUG else None,
]))

ROOT_URLCONF = 'backend.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
                'base.context_processors.settings',
            ],
        },
    },
]

WSGI_APPLICATION = 'backend.wsgi.application'

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'simple': {
            'format': '[{levelname}] [{name}] {message}',
            'style': '{',
        },
    },
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'formatter': 'simple',
        },
    },
    'django.utils.autoreload': {
        'level': 'INFO',
    },
    'root': {
        'handlers': ['console'],
        'level': 'ERROR' if TESTING else os.environ.get("LOG_LEVEL", "INFO").upper(),
    },
    'loggers': {
        'raven': {
            'propagate': False,
        },
        'elasticsearch': {
            'level': 'ERROR' if TESTING else 'WARNING',
        },
        **({'django': {'level': 'ERROR'}} if TESTING else {}),
    },
}

MESSAGE_STORAGE = 'django.contrib.messages.storage.session.SessionStorage'

# The default amount of intervals to try to return on aggregations
AGGREGATIONS_DEFAULT_INTERVAL_QUANTITY = int(os.environ.get("AGGREGATIONS_DEFAULT_INTERVAL_QUANTITY", "30"))

# CORS

CORS_ORIGIN_ALLOW_ALL = os.environ.get("CORS_ORIGIN_ALLOW_ALL", "1") == "1"

CORS_ORIGIN_WHITELIST = list(filter(bool, os.environ.get("CORS_ORIGIN_WHITELIST", "").split(",")))

# Database
# https://docs.djangoproject.com/en/2.1/ref/settings/#databases

DATABASES = {
    'default': {
        'ENGINE': 'django.contrib.gis.db.backends.postgis',
        'NAME': os.environ.get("DATABASE_NAME", "backend"),
        'HOST': os.environ.get("DATABASE_HOST", "localhost"),
        'USER': os.environ.get("DATABASE_USER", "backend"),
        'PASSWORD': os.environ.get("DATABASE_PASSWORD", "backend"),
        'PORT': os.environ.get("DATABASE_PORT", "5432"),
        'CONN_MAX_AGE': int(os.environ.get("DATABASE_CONN_MAX_AGE", "180")),  # 3 minutes by default
    }
}

ELASTICSEARCH_PROTOCOL = os.environ.get("ELASTICSEARCH_PROTOCOL", "http")
ELASTICSEARCH_HOST = os.environ.get("ELASTICSEARCH_HOST", "localhost")
ELASTICSEARCH_PORT = int(os.environ.get("ELASTICSEARCH_PORT", "9200"))
ELASTICSEARCH_USER = os.environ.get("ELASTICSEARCH_USER")
ELASTICSEARCH_PASSWORD = os.environ.get("ELASTICSEARCH_PASSWORD")

KIBANA_HOST = os.environ.get("KIBANA_HOST", "localhost")
KIBANA_PORT = int(os.environ.get("KIBANA_PORT", "5601"))

# Password validation
# https://docs.djangoproject.com/en/2.1/ref/settings/#auth-password-validators

AUTHENTICATION_BACKENDS = (
    'django.contrib.auth.backends.ModelBackend',
    'guardian.backends.ObjectPermissionBackend',
)

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

LOGIN_URL = '/admin/login'

# Internationalization
# https://docs.djangoproject.com/en/2.1/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_L10N = True

USE_TZ = True

# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/2.1/howto/static-files/

STATIC_ROOT = os.environ.get("STATIC_ROOT", os.path.join(BASE_DIR, "static-root"))

STATIC_URL = os.environ.get("STATIC_URL", '/api/static/')

STATICFILES_DIRS = tuple(
    p
    for p in Path(BASE_DIR).glob("**/static/")
    if p.is_dir()
)

# Media files

MEDIA_ROOT = os.environ.get("MEDIA_ROOT", os.path.join(BASE_DIR, "media-root"))

MEDIA_URL = '/api/media/'

DEFAULT_FILE_STORAGE = os.environ.get("DEFAULT_FILE_STORAGE", None) or 'django.core.files.storage.FileSystemStorage'

STORAGE_IS_S3 = DEFAULT_FILE_STORAGE == "storages.backends.s3boto3.S3Boto3Storage"

# django-storages Amazon S3 config
AWS_ACCESS_KEY_ID = os.environ.get("S3_ACCESS_KEY_ID", None) or None
AWS_SECRET_ACCESS_KEY = os.environ.get("S3_SECRET_ACCESS_KEY", None) or None
AWS_STORAGE_BUCKET_NAME = os.environ.get("S3_BUCKET_NAME", None) or None
AWS_S3_ENDPOINT_URL = os.environ.get("S3_ENDPOINT_URL", None) or None
AWS_DEFAULT_ACL = None
AWS_S3_FILE_OVERWRITE = False

# Sentry config

COMMIT = os.environ.get("COMMIT", "local")

RAVEN_CONFIG = {
    'dsn': os.environ.get("BACKEND_SENTRY_DSN"),
    'release': COMMIT,
}

# Cache config

REDIS_HOST = os.environ.get("REDIS_HOST", "localhost")
REDIS_PORT = os.environ.get("REDIS_PORT", "6379")
REDIS_PASSWORD = os.environ.get("REDIS_PASSWORD")
REDIS_SSL = os.environ.get("REDIS_SSL", "0") == "1"

CACHEOPS_ENABLED = not TESTING

CACHEOPS_REDIS = {
    "host": REDIS_HOST,
    "port": REDIS_PORT,
    **({"password": REDIS_PASSWORD} if REDIS_PASSWORD else {}),
    "ssl": REDIS_SSL
}

CACHEOPS = {
    '*.*': {'timeout': 10 * 60},
}

CACHEOPS_DEGRADE_ON_FAILURE = True


def CACHEOPS_PREFIX(_):
    return f"backend.{NAMESPACE}"


# GIS config

PROJECTION_SRID = 32719

PROJECTION = f"epsg:{PROJECTION_SRID}"

# REST Framework

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
        "rest_framework.authentication.TokenAuthentication",
        "rest_framework.authentication.SessionAuthentication",
    ),
    "DEFAULT_FILTER_BACKENDS": (
        "django_filters.rest_framework.DjangoFilterBackend",
    ),
    "DEFAULT_PAGINATION_CLASS": "base.pagination.PageNumberPagination",
    "DEFAULT_RENDERER_CLASSES": (
        "rest_framework.renderers.JSONRenderer",
        'rest_framework.renderers.BrowsableAPIRenderer',
    ),
    "DEFAULT_VERSIONING_CLASS": "rest_framework.versioning.NamespaceVersioning",
    'DEFAULT_SCHEMA_CLASS': 'rest_framework.schemas.coreapi.AutoSchema',
}

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(days=int(os.environ.get("JWT_ACCESS_TOKEN_LIFETIME", 28))),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=int(os.environ.get("JWT_REFRESH_TOKEN_LIFETIME", 35))),
}

if os.environ.get("SSL_ENABLED") == "1":
    SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True

# Users, groups, roles

INTERNAL_USERS_GROUP = "internal-operations"
AUTHORITY_GROUP = "authority"
MINE_GROUP = "mine"

# RabbitMQ

AMQP_HOST = os.environ.get("AMQP_HOST", "localhost")
AMQP_PORT = int(os.environ.get("AMQP_PORT", "5672"))
AMQP_USERNAME = os.environ.get("AMQP_USERNAME", "guest")
AMQP_PASSWORD = os.environ.get("AMQP_PASSWORD", "guest")
AMQP_VHOST = os.environ.get("AMQP_VHOST", "/")
AMQP_SSL = os.environ.get("AMQP_SSL", "0") == "1"
AMQP_EXCHANGE = os.environ.get("AMQP_EXCHANGE", "enrichment")
AMQP_TOPIC = os.environ.get("AMQP_TOPIC", "data.timeframe")
AMQP_MESSAGE_TTL = int(os.environ.get("AMQP_MESSAGE_TTL", f"{5 * 60 * 60 * 1000}"))
AMQP_QUEUE_TTL = int(os.environ.get("AMQP_QUEUE_TTL", f"{24 * 60 * 60 * 1000}"))

AMQP_FEDERATED_EXCHANGE = f"federated.{NAMESPACE}"
# Set this to a fixed value to share the load between consumer replicas
AMQP_FEDERATED_QUEUE = f"federated.{NAMESPACE}." + \
                       os.environ.get("AMQP_FEDERATED_QUEUE", f"random.{secrets.token_urlsafe(16)}")
AMQP_FEDERATED_ROUTING_KEY = os.environ.get("AMQP_FEDERATED_ROUTING_KEY", "data.commands")

BROKER_URL = f"amqp://{AMQP_USERNAME}:{AMQP_PASSWORD}@{AMQP_HOST}:{AMQP_PORT}{AMQP_VHOST}"

# SMC<->SML Communication
SMC_AMQP_HOST = os.environ.get("SMC_AMQP_HOST", None)
SMC_AMQP_PORT = int(os.environ.get("SMC_AMQP_PORT", "5672"))
SMC_AMQP_USERNAME = os.environ.get("SMC_AMQP_USERNAME", None)
SMC_AMQP_PASSWORD = os.environ.get("SMC_AMQP_PASSWORD", None)
SMC_AMQP_VHOST = os.environ.get("SMC_AMQP_VHOST", "/")
SMC_AMQP_SSL = os.environ.get("SMC_AMQP_SSL", "0") == "1"
SMC_AMQP_EXCHANGE = f"federated.{NAMESPACE}"
SMC_AMQP_QUEUE = f"federated.{NAMESPACE}." + \
                 os.environ.get("SMC_AMQP_QUEUE", f"random.{secrets.token_urlsafe(16)}")

SMC_S3_ACCESS_KEY_ID = os.environ.get("SMC_S3_ACCESS_KEY_ID", None) or None
SMC_S3_SECRET_ACCESS_KEY = os.environ.get("SMC_S3_SECRET_ACCESS_KEY", None) or None
SMC_S3_BUCKET_NAME = os.environ.get("SMC_S3_BUCKET_NAME", None) or None
SMC_S3_ENDPOINT_URL = os.environ.get("SMC_S3_ENDPOINT_URL", None) or None

SMC_BROKER_URL = f"amqp://{SMC_AMQP_USERNAME}:{SMC_AMQP_PASSWORD}@{SMC_AMQP_HOST}:{SMC_AMQP_PORT}{SMC_AMQP_VHOST}"

STACK_IS_SML = SMC_AMQP_HOST is not None

# Enrichment

ENRICHMENT_FORWARD_COMMAND = os.environ.get("ENRICHMENT_FORWARD_COMMAND", "enrichment.results")
AUTO_DELIVER_COMMAND = 'remote.data_deliver'
AUTO_DELIVER_CATEGORIES = [
    'emac-index'
]
