from alerts.modules.base import BaseController


class Controller(BaseController):
    children = ("_.baz",)
