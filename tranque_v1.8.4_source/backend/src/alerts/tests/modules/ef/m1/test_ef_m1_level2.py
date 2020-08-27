from django.test import override_settings
from django.utils import timezone

from alerts.collector import target_controllers
from alerts.tests.controller_base import ControllerBaseTestCase


@override_settings(STACK_IS_SML=True)
class TerremotoTestCase(ControllerBaseTestCase):

    @property
    def controller(self):
        return target_controllers(self.target_object)["_.ef.m1.level2.terremoto-4-6"]

    def test_create_by_intent_rules(self):
        ctrl = self.controller(None, (), timezone.now(), self.target_object)

        with self.subTest("correct initial state"):
            intent = self.setup_mine_intent(self.controller.states.B)
            result = ctrl.create_by_intent((), intent)
            self.assertNotEqual(result, self.controller.no_result)
            self.assertEqual(result.state, self.controller.states.B)

        with self.subTest("incorrect initial state"):
            intent = self.setup_mine_intent(self.controller.states.D)
            result = ctrl.create_by_intent((), intent)
            self.assertEqual(result, self.controller.no_result)

        with self.subTest("authority incorrect initial state"):
            intent = self.setup_authority_intent(self.controller.states.D)
            result = ctrl.create_by_intent((), intent)
            self.assertEqual(result, self.controller.no_result)

    def test_create_rules(self):
        ctrl = self.controller(None, (), timezone.now(), self.target_object)

        with self.subTest("none are > 0"):
            timeseries = self.setup_timeseries(events=[{"_id": "id1", "value": 0}, {"_id": "id2", "value": -1}])
            result = ctrl.create((timeseries,))
            self.assertEqual(result, self.controller.no_result)

        with self.subTest("some are > 0"):
            timeseries = self.setup_timeseries(
                events=[{"_id": "id3", "value": 0}, {"_id": "id4", "value": 1}, {"_id": "id5", "value": 0.1}])
            result = ctrl.create((timeseries,))
            self.assertNotEqual(result, self.controller.no_result)
            self.assertEqual(result.state, self.controller.states.B)

    def test_update_by_intent_rules(self):
        ctrl_a, ctrl_b, ctrl_c, ctrl_d = (
            self.controller(self.setup_ticket(state), (), timezone.now(), self.target_object)
            for state in self.controller.states
        )

        with self.subTest("authority close"):
            intent = self.setup_authority_intent(self.controller.CLOSED_STATE)
            result = ctrl_d.update_by_intent((), intent)
            self.assertNotEqual(result, self.controller.no_result)
            self.assertEqual(result.state, self.controller.CLOSED_STATE)

        with self.subTest("mine close, state B, with document"):
            intent = self.setup_mine_intent(self.controller.CLOSED_STATE, document=True)
            result = ctrl_b.update_by_intent((), intent)
            self.assertNotEqual(result, self.controller.no_result)
            self.assertEqual(result.state, self.controller.CLOSED_STATE)

        with self.subTest("mine close, state B, without document"):
            intent = self.setup_mine_intent(self.controller.CLOSED_STATE, document=False)
            result = ctrl_b.update_by_intent((), intent)
            self.assertNotEqual(result, self.controller.no_result)
            self.assertEqual(result.state, self.controller.CLOSED_STATE)

        with self.subTest("authority scale"):
            intent = self.setup_authority_intent(self.controller.states.D)
            result = ctrl_b.update_by_intent((), intent)
            self.assertNotEqual(result, self.controller.no_result)
            self.assertEqual(result.state, self.controller.states.D)

        with self.subTest("descalation"):
            intent = self.setup_authority_intent(self.controller.states.B)
            result = ctrl_c.update_by_intent((), intent)
            self.assertEqual(result, self.controller.no_result)
            self.assertEqual(intent.issue, intent.IssueOptions.BLOCKED_BY_RULES)

    def test_update_rules(self):
        for state in self.controller.states:
            ctrl = self.controller(self.setup_ticket(state), (), timezone.now(), self.target_object)
            timeseries = self.setup_timeseries(events=[{"_id": "id1", "value": 1}, {"_id": "id2", "value": 0}])
            result = ctrl.update((timeseries,))
            self.assertEqual(result.state, state)
