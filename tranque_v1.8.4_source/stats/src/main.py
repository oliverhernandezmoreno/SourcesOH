import logging

from app import create_app
import settings

logging.basicConfig(
    format="[{levelname}] [{name}] {message}",
    style="{",
    level=logging.DEBUG if settings.DEBUG else logging.INFO,
)
app = create_app(__name__, settings.freeze())
