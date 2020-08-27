import contextlib
import importlib
import inspect
import logging
from pathlib import Path
import re

from django.conf import settings

from alerts.modules.base import BaseController, spread_model_catalog
from alerts.modules.rules import module_matches

logger = logging.getLogger(__name__)


class ModulesCollector:

    def __init__(self):
        self.modules_root = Path(settings.ALERT_MODULES_ROOT)
        self.overrides = []
        self.refresh()

    def refresh(self):
        self.modules = self.import_from(self.modules_root)

    def import_from(self, root):
        package = ".".join(root.relative_to(Path(settings.BASE_DIR)).parts)
        modules = {}
        for module_path in root.glob("**/*.py"):
            module_name = ".".join(module_path.relative_to(root).parts)[:-3]
            if module_name == "base" or module_name.endswith("__init__"):
                continue
            try:
                module = importlib.import_module(f"{package}.{module_name}")
            except ImportError as e:
                logger.warn(f"non existent alert module {module_name}: {e}")
                continue
            if not hasattr(module, "Controller"):
                continue
            if not getattr(module.Controller, "controller_factory", False) and \
               not inspect.isclass(module.Controller) and \
               not issubclass(module.Controller, BaseController):
                logger.warn(f"alert module {module_name}'s Controller is not a subclass or factory of BaseController")
                continue
            modules[module_name] = module
        return modules

    @contextlib.contextmanager
    def override(self, root):
        self.overrides.append(self.import_from(root))
        yield self
        self.overrides.pop()

    def resolve(self):
        return self.overrides[-1] if self.overrides else self.modules

    def __getitem__(self, k):
        return self.resolve()[k]

    def items(self):
        return self.resolve().items()

    def keys(self):
        return self.resolve().keys()

    def values(self):
        return self.resolve().values()

    def __iter__(self):
        return iter(self.resolve())

    def get(self, k, default_value=None):
        return self.resolve().get(k, default_value)

    def __repr__(self):
        return repr(self.resolve())


class ControllersCollection:

    def __init__(self, collector):
        self.collector = collector

    def get_base_name(self, expanded_name):
        if expanded_name.startswith("_."):
            return expanded_name[2:]
        match = re.match(r"^\w+\(.*\)\.(.+)$", expanded_name)
        if match is not None:
            return match.group(1)
        return None

    def get_base_controller(self, expanded_name):
        base_name = self.get_base_name(expanded_name)
        module = None if base_name is None else self.collector.get(base_name)
        if module is None:
            return None
        if getattr(module.Controller, "controller_factory", False):
            return module.Controller.controller_template
        return module.Controller

    def spread(self, controller, target, base_name):
        if inspect.isclass(controller) and issubclass(controller, BaseController):
            name = f"_.{base_name}"
            logger.debug(f"Defined controller {name} directly")
            yield name, type("Controller", (controller,), {"module": name})
        if getattr(controller, "controller_factory", False):
            for concrete_controller in controller(target):
                name = ".".join([
                    "".join([
                        spread_model_catalog[concrete_controller.spread_term[0]][1],
                        "(", str(concrete_controller.spread_term[1]), ")",
                    ]),
                    base_name,
                ])
                concrete_controller.module = name
                logger.debug(f"Defined controller {name} via spread")
                yield name, concrete_controller

    def __call__(self, target):
        controllers = {
            name: controller
            for base_name, module in self.collector.items()
            for name, controller in self.spread(module.Controller, target, base_name)
        }
        # trace children and parents
        for name, controller in controllers.items():
            controller.child_modules = tuple(
                child_name
                for pattern in controller.children
                for child_name in controllers
                if module_matches(child_name, pattern)
            )
        for name, controller in controllers.items():
            controller.parent_modules = tuple(
                parent_name
                for parent_name, parent in controllers.items()
                if name in parent.child_modules
            )
        return controllers


target_controllers = ControllersCollection(ModulesCollector())


def is_child(controllers, candidate, parent):
    if candidate == parent:
        return False
    if any(module_matches(candidate, child) for child in controllers[parent].children):
        return True
    return any(
        is_child(controllers, candidate, child)
        for child_pattern in controllers[parent].children
        for child in controllers
        if module_matches(child, child_pattern)
    )


def is_parent(controllers, candidate, child):
    return is_child(controllers, child, candidate)
