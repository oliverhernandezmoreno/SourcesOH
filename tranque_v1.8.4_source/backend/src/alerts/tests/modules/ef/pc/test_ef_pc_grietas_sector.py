import secrets

from django.test import override_settings
from django.utils import timezone

from alerts.collector import target_controllers
from alerts.tests.controller_base import ControllerBaseTestCase
from targets.models import DataSourceGroup


@override_settings(STACK_IS_SML=True)
class GrietasSectorTestCase(ControllerBaseTestCase):

    def setUp(self):
        super().setUp()
        target = self.target_object
        self.sector = DataSourceGroup.objects.create(
            target=self.target_object,
            canonical_name=f"sector-test-{secrets.token_urlsafe(4)}",
        )
        sectors = DataSourceGroup.objects.create(
            target=target,
            name='sectores',
            canonical_name='sectores',
        )
        sectors.children.add(self.sector)

    @property
    def controller(self):
        return target_controllers(self.target_object)[f"g({self.sector.canonical_name}).ef.poc.grietas-sector"]

    def test_create_by_intent_rules(self):
        ctrl = self.controller(None, (), timezone.now(), self.target_object)

        with self.subTest("correct initial state"):
            intent = self.setup_mine_intent(self.controller.states.C1)
            result = ctrl.create_by_intent((), intent)
            self.assertNotEqual(result, self.controller.no_result)
            self.assertEqual(result.state, self.controller.states.C1)

        with self.subTest("incorrect initial state"):
            intent = self.setup_mine_intent(self.controller.states.C2)
            result = ctrl.create_by_intent((), intent)
            self.assertEqual(result, self.controller.no_result)
            self.assertEqual(intent.issue, intent.IssueOptions.BLOCKED_BY_RULES)

    def test_create_rules(self):
        ctrl = self.controller(None, (), timezone.now(), self.target_object)

        timeseries = self.setup_timeseries(
            template_name="ef-mvp.m2.parameters.discrete.inputs.grietas",
            events=[{"_id": "id", "value": 1}],
        )
        result = ctrl.create((timeseries,))
        self.assertNotEqual(result, self.controller.no_result)
        self.assertEqual(result.state, self.controller.states.C1)

    def test_update_by_intent_rules(self):
        ctrl = self.controller(
            self.setup_ticket(self.controller.states.C1),
            (self.setup_ticket("some-state", module="_.ef.m1.level2.terremoto-4-6"),),
            timezone.now(),
            self.target_object,
        )
        with self.subTest("scale correctly"):
            intent = self.setup_authority_intent(self.controller.states.C2)
            result = ctrl.update_by_intent((), intent)
            self.assertNotEqual(result, self.controller.no_result)
            self.assertEqual(result.state, self.controller.states.C2)

        with self.subTest("block incorrect scale"):
            intent = self.setup_authority_intent(self.controller.states.C3)
            result = ctrl.update_by_intent((), intent)
            self.assertEqual(result, self.controller.no_result)
            self.assertEqual(intent.issue, intent.IssueOptions.BLOCKED_BY_RULES)

    def test_update_rules(self):
        ctrl = self.controller(self.setup_ticket(self.controller.states.C2), (), timezone.now(), self.target_object)

        with self.subTest("adds logs when event"):
            timeseries = self.setup_timeseries(
                template_name="ef-mvp.m2.parameters.discrete.inputs.grietas",
                events=[{"_id": "id1", "value": 1}, {"_id": "id2", "value": 0}, {"_id": "id3", "value": 2}],
            )
            result = ctrl.update((timeseries,))
            self.assertNotEqual(result, self.controller.no_result)
            self.assertEqual(result.state, self.controller.states.C2)
            self.assertEqual(
                [e for log in result.logs for e in log.timeseries[0]["events"]],
                ["id1", "id2", "id3"],
            )

        with self.subTest("does nothing without events"):
            timeseries = self.setup_timeseries(
                template_name="ef-mvp.m2.parameters.discrete.inputs.grietas",
                events=[{"_id": "id4", "value": -1}, {"_id": "id5", "value": 0}, {"_id": "id6", "value": -2}],
            )
            result = ctrl.update((timeseries,))
            self.assertEqual(result, self.controller.no_result)
