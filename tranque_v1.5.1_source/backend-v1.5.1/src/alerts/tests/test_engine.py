import secrets
from pathlib import Path
from unittest.mock import patch

from django.test import override_settings

from alerts import engine
from alerts.collector import target_controllers
from alerts.models import Ticket, UserIntent, TicketComment, TicketLog, AuthorizationRequest
from alerts.modules.rules import Rule
from alerts.tests.base import with_test_modules
from alerts.tests.controller_base import ControllerBaseTestCase
from api.tests.base import remove_elasticsearch_test_indices
from targets import elastic
from targets.models import Timeseries

TESTS_DIR = Path(__file__).parent


class ModulePlannerTestCase(ControllerBaseTestCase):

    def test_controllers_dont_form_cycles(self):
        list(engine.controllers_by_level(target_controllers(self.target_object)))

    def test_controllers_by_level_fails_on_cycles(self):
        with target_controllers.collector.override(TESTS_DIR / "fake_cyclical_modules"):
            try:
                controllers = target_controllers(self.target_object)
                list(engine.controllers_by_level(controllers))
                assert False, f"didn't fail; modules are {controllers}"
            except RuntimeError as e:
                assert e.args[0].startswith("controllers form a loop!")

    def test_controllers_by_level_yields_levels(self):
        with target_controllers.collector.override(TESTS_DIR / "fake_trivial_modules"):
            levels = list(engine.controllers_by_level(target_controllers(self.target_object)))
            self.assertEquals(
                [set(level) for level in levels],
                [
                    {"_.ipsum.sed", "_.ipsum.amet",
                        f"g({self.g1.canonical_name}).bar", f"g({self.g2.canonical_name}).bar", "_.baz"},
                    {"_.foo", "_.ipsum.dolor"},
                    {"_.lorem"}
                ],
            )
            filtered_controllers = engine.controllers_by_hints(self.target_object, hints=["_.baz"])
            filtered_levels = list(engine.controllers_by_level(filtered_controllers))
            self.assertEquals(
                [set(level) for level in filtered_levels],
                [{"_.baz"}, {"_.foo"}, {"_.lorem"}],
            )


@override_settings(STACK_IS_SML=True, SMC_S3_BUCKET_NAME='SML_BUCKET', NAMESPACE='SML_NAMESPACE')
class ModuleSetupAndRunTestCase(ControllerBaseTestCase):
    PI = 3.1415
    E = 2.718

    def setUp(self):
        super().setUp()
        # Create a few tickets linked to the fake modules
        # Tickets are EF in these cases (determined in BaseTestController when getting conditions)
        self.tickets = [
            Ticket.objects.create(
                module="_.foo",
                state="A",
                target=self.target_object,
            ),
            Ticket.objects.create(
                module=f"g({self.g1.canonical_name}).bar",
                state=Ticket.TicketState.CLOSED,
                target=self.target_object,
            ),
            Ticket.objects.create(
                module="_.baz",
                state="A",
                target=self.target_object,
            ),
            Ticket.objects.create(
                module="_.lorem",
                state="A",
                target=self.target_object,
            ),
            Ticket.objects.create(
                module="_.ipsum.dolor",
                state=Ticket.TicketState.CLOSED,
                target=self.target_object,
            ),
            Ticket.objects.create(
                module="_.ipsum.sed",
                state="A",
                target=self.target_object,
            ),
            Ticket.objects.create(
                module="_.ipsum.amet",
                state="A1",
                target=self.target_object,
            )
        ]
        # Create a few timeseries as specified in foo, bar and lorem
        self.timeseries = [
            ("_.foo", Timeseries.objects.create(
                target=self.target_object,
                canonical_name=f"foo-test-{secrets.token_urlsafe(6)}",
            )),
            (f"g({self.g1.canonical_name}).bar", Timeseries.objects.create(
                target=self.target_object,
                canonical_name=f"bar-test-{secrets.token_urlsafe(6)}",
                template_name='bar-test',
                data_source_group=self.g1,
            )),
            ("_.lorem", Timeseries.objects.create(
                target=self.target_object,
                canonical_name=f"lorem-test-{secrets.token_urlsafe(6)}",
            )),
        ]
        self.dependency_timeseries = Timeseries.objects.create(
            target=self.target_object,
            canonical_name=f"dependency-input-for-{self.timeseries[1][1].canonical_name}-{secrets.token_urlsafe(6)}",
        )
        # Insert two events for each fake timeseries
        dependency_id = f'dependency-event-for-{self.timeseries[1][1]}-{secrets.token_urlsafe(6)}'
        self.bar_events = [
            {
                '_id': dependency_id,
                **self.dependency_timeseries.as_event(123, "2000-01-02")
            },
            {
                '_id': f'first-event-for-{self.timeseries[1][1]}-{secrets.token_urlsafe(6)}',
                **self.timeseries[1][1].as_event(self.PI, "2000-01-02"),
                'dependencies': [dependency_id]
            },
            {
                '_id': f'second-event-for-{self.timeseries[1][1]}-{secrets.token_urlsafe(6)}',
                **self.timeseries[1][1].as_event(self.E, "2000-01-01"),
            }
        ]
        elastic.index(self.timeseries[0][1].as_event(self.PI, "2000-01-02"), refresh="true")
        elastic.index(self.timeseries[0][1].as_event(self.E, "2000-01-01"), refresh="true")
        elastic.bulk_index(self.bar_events, refresh="true")
        elastic.index(self.timeseries[2][1].as_event(self.PI, "2000-01-02"), refresh="true")
        elastic.index(self.timeseries[2][1].as_event(self.E, "2000-01-01"), refresh="true")
        # Create a random document
        self.document = self.random_document()
        # Create a few user intents
        self.intents = [
            UserIntent.objects.create(
                module="_.foo",
                user=self.superuser_object,
                target=self.target_object,
                content={"state": Ticket.TicketState.CLOSED},
            ),
            UserIntent.objects.create(
                module="_.lorem",
                user=self.superuser_object,
                target=self.target_object,
                content={"state": "B", "document": self.document.id},
            ),
            UserIntent.objects.create(
                module="_.baz",
                user=self.superuser_object,
                target=self.target_object,
                content={"state": "B", "document": self.document.id},
            ),
            UserIntent.objects.create(
                module="_.ipsum.amet",
                user=self.superuser_object,
                target=self.target_object,
                content={"state": "D", "document": self.document.id},
            ),
        ]

    def tearDown(self):
        # TODO search for a way of doing atomic elasticsearch tests
        remove_elasticsearch_test_indices()

    def test_setup_makes_queries_properly(self):
        with target_controllers.collector.override(TESTS_DIR / "fake_trivial_modules"):
            test_modules = ("_.foo", "_.lorem", "_.ipsum.dolor")
            controllers = target_controllers(self.target_object)
            tickets, timeseries, intents = engine.setup(self.target_object, {
                m: controllers[m]
                for m in test_modules
            })
            self.assertEqual(
                frozenset(tickets),
                frozenset(
                    ticket
                    for ticket in self.tickets
                    if ticket.module in test_modules
                    if ticket.state != Ticket.TicketState.CLOSED
                ),
            )
            self.assertEqual(
                frozenset(ts for _, ts in timeseries),
                frozenset(ts for name, ts in self.timeseries if name in test_modules),
            )
            # foo asked for three events, but only two can be fetched
            self.assertEqual(
                frozenset(
                    event["value"]
                    for name, ts in timeseries
                    for event in ts.events
                    if name == "_.foo"
                ),
                frozenset([self.PI, self.E]),
            )
            # lorem asked for one event implicitly, so only one is available
            self.assertEqual(
                frozenset(
                    event["value"]
                    for name, ts in timeseries
                    for event in ts.events
                    if name == "_.lorem"
                ),
                frozenset([self.PI]),
            )
            self.assertEqual(
                frozenset(intents),
                frozenset([intent for intent in self.intents if intent.module in test_modules]),
            )

    def test_run_with_unmatched_hints_does_nothing(self):
        with target_controllers.collector.override(TESTS_DIR / "fake_trivial_modules"):
            affected = engine.run(self.target_object, hints=["nothing-will-match"])
            self.assertEqual(affected, [])

    def test_run_invokes_the_proper_controllers(self):
        """Test the expected behaviour of controllers.

        This test is defined together with the fake modules
        themselves, in that the expected behaviour is to be contrasted
        with their implementation.

        """
        with target_controllers.collector.override(TESTS_DIR / "fake_trivial_modules"):
            # Test first run, attending all intents
            affected = engine.run(self.target_object)

            # bar is opened and is not the same ticket which started
            # Initial closed "bar" ticket was not opened.
            # Another ticket with the same controller was created, according to new events
            ticket = Ticket.objects.filter(
                module=f"g({self.g1.canonical_name}).bar"
            ).first()

            self.assertIn(ticket, affected)
            self.assertNotIn(ticket, self.tickets)

            # check there are a log message for the creation of '.bar' ticket
            logs = TicketLog.objects.filter(ticket=ticket)
            self.assertEqual(len(logs), 1)
            self.assertEqual(logs.first().meta['description'], Rule.ActionDescription.CREATE)
            self.assertEqual(logs.first().meta['next_state'], 'A')

            # foo is NOT closed, because neither bar nor baz are closed
            ticket = Ticket.objects.filter(
                module="_.foo",
                state="A",
            ).first()
            self.assertIn(ticket, self.tickets)
            self.assertNotIn(ticket, affected)

            # check there are no logs for '_.foo' ticket because it didn't change
            logs = TicketLog.objects.filter(ticket=ticket)
            self.assertEqual(len(logs), 0)

            # lorem escalates to B because of test intent and no conditions required
            ticket = Ticket.objects.filter(
                module="_.lorem",
                state="B",
            ).first()

            self.assertIn(ticket, affected)
            self.assertEqual(ticket.logs.first().documents.first(), self.document)

            # check there are a log message for the escalation of '_.lorem' ticket
            logs = TicketLog.objects.filter(ticket=ticket)
            self.assertEqual(len(logs), 1)
            self.assertEqual(logs.first().meta['description'], Rule.ActionDescription.ESCALATE)
            self.assertEqual(logs.first().meta['next_state'], 'B')

            # baz does not escalate to B
            # blocked by conditions, it requires at least a comment
            self.assertFalse(Ticket.objects.filter(
                module="_.baz",
                state="B",
            ).exists())

            # validate intent was attended and blocked by rules
            attended_intent = UserIntent.objects.get(id=self.intents[2].id)
            self.assertIsNotNone(attended_intent.attended_at)
            self.assertEqual(attended_intent.issue, UserIntent.IssueOptions.UNMET_CONDITIONS)

            # validate state has not changed
            baz_ticket = Ticket.objects.filter(
                module="_.baz",
                state="A",
            ).first()
            self.assertEqual(self.tickets[2].id, baz_ticket.id)

            # check there are no logs for '_.baz' ticket because it didn't change
            logs = TicketLog.objects.filter(ticket=baz_ticket)
            self.assertEqual(len(logs), 0)

            # ipsum.amet escalates to generic state D from A1
            ticket = Ticket.objects.filter(
                module="_.ipsum.amet",
                state="D",
            ).first()
            self.assertIn(ticket, affected)
            self.assertEqual(ticket.logs.first().documents.first(), self.document)
            # check there are a log message for the escalation of '_.ipsum.amet' ticket
            logs = TicketLog.objects.filter(ticket=ticket)
            self.assertEqual(len(logs), 1)
            self.assertEqual(logs.first().meta['description'], Rule.ActionDescription.ESCALATE)
            self.assertEqual(logs.first().meta['next_state'], 'D')

            # Test second run, without state changes
            affected = engine.run(self.target_object)
            self.assertEqual(affected, [])

            # Recreate baz escalate intent
            UserIntent.objects.create(
                module="_.baz",
                user=self.superuser_object,
                target=self.target_object,
                content={"state": "B", "document": self.document.id},
            )

            # Add comment to complete conditions
            TicketComment.objects.create(ticket=baz_ticket, comment_type=TicketComment.CommentType.EVENT_MANAGEMENT)

            # Test third run, attending the recreated intent with complete conditions
            affected = engine.run(self.target_object)
            baz_ticket.refresh_from_db()
            self.assertEqual([baz_ticket], affected)
            self.assertEqual(baz_ticket.state, "B")
            self.assertEqual(baz_ticket.result_state["level"], 2)

            # check there are a log message for the escalation of '_.baz' ticket
            logs = TicketLog.objects.filter(ticket=baz_ticket)
            self.assertEqual(len(logs), 1)
            self.assertEqual(logs.first().meta['description'], Rule.ActionDescription.ESCALATE)
            self.assertEqual(logs.first().meta['next_state'], 'B')

    def test_ticket_logs_contains_relevant_events_and_dependencies(self):
        with target_controllers.collector.override(TESTS_DIR / "fake_trivial_modules"):
            # run engine to resolve setup intents and events
            engine.run(self.target_object)

            # bar ticket was created by events
            ticket = Ticket.objects.filter(
                module=f"g({self.g1.canonical_name}).bar"
            ).first()

            # assert it contains a single creation log
            self.assertEqual(ticket.logs.count(), 1)
            # assert log has two timeseries
            # one for the relevant event and one for an event dependency
            log = ticket.logs.first()
            self.assertIsNotNone(log.timeseries)
            self.assertEqual(len(log.timeseries), 2)
            ts = log.timeseries[0]
            self.assertEqual(ts['canonical_name'], self.timeseries[1][1].canonical_name)
            # assert timeseries has relevant event PI
            self.assertEqual(len(ts['events']), 2)
            self.assertSetEqual(set(ts['events']), {e['_id'] for e in self.bar_events[1:]})

            ts_dependency = log.timeseries[1]
            self.assertEqual(ts_dependency['canonical_name'], self.dependency_timeseries.canonical_name)
            # assert timeseries has event
            self.assertEqual(len(ts_dependency['events']), 1)
            self.assertEqual(ts_dependency['events'][0], self.bar_events[0]['_id'])

    def test_closing_a_ticket_by_intent(self):
        with target_controllers.collector.override(TESTS_DIR / "fake_trivial_modules"):
            # run engine to resolve setup intents and events
            engine.run(self.target_object)
            foo_ticket = self.tickets[0]

            # check there are no logs in ticket yet
            logs = TicketLog.objects.filter(ticket=foo_ticket)
            self.assertEqual(len(logs), 0)

            # close children tickets bar and baz to complete close conditions
            for t in Ticket.objects.filter(module__in=[f"g({self.g1.canonical_name}).bar", "_.baz"]).exclude(
                    state=Ticket.TicketState.CLOSED):
                t.state = Ticket.TicketState.CLOSED
                t.save()

            # recreate close intent
            UserIntent.objects.create(
                module="_.foo",
                user=self.superuser_object,
                target=self.target_object,
                content={"state": Ticket.TicketState.CLOSED},
            )

            # run engine for '_.foo'
            affected = engine.run(self.target_object, hints=['_.foo'])

            # assert ticket was closed
            self.assertEqual(len(affected), 1)
            self.assertEqual(affected[0].id, foo_ticket.id)
            foo_ticket.refresh_from_db()
            self.assertEqual(foo_ticket.state, Ticket.TicketState.CLOSED)

            # check there is 1 log related to the closed ticket
            logs = TicketLog.objects.filter(ticket=foo_ticket)
            self.assertEqual(len(logs), 1)
            self.assertEqual(logs.first().meta['description'], Rule.ActionDescription.CLOSE)

    def test_archiving_a_ticket_by_intent(self):
        with target_controllers.collector.override(TESTS_DIR / "fake_trivial_modules"):
            # run engine to resolve setup intents and events
            engine.run(self.target_object, hints=['_.foo'])
            foo_ticket = self.tickets[0]

            # check there are no logs in ticket yet
            logs = TicketLog.objects.filter(ticket=foo_ticket)
            self.assertEqual(len(logs), 0)

            # create archive intent
            intent = UserIntent.objects.create(
                module="_.foo",
                user=self.superuser_object,
                target=self.target_object,
                content={"archived": True},
            )

            # run engine again to resolve new intent
            affected = engine.run(self.target_object, hints=['_.foo'])

            # assert ticket was not archived because unmet conditions
            self.assertEqual(len(affected), 0)

            # check there are no logs in ticket yet
            logs = TicketLog.objects.filter(ticket=foo_ticket)
            self.assertEqual(len(logs), 0)

            foo_ticket.refresh_from_db()
            self.assertFalse(foo_ticket.archived)
            intent.refresh_from_db()
            self.assertIsNotNone(intent.attended_at)

            # Add comment to complete conditions
            TicketComment.objects.create(ticket=foo_ticket, comment_type=TicketComment.CommentType.EVENT_MANAGEMENT)

            # Recreate archive intent
            intent = UserIntent.objects.create(
                module="_.foo",
                user=self.superuser_object,
                target=self.target_object,
                content={"archived": True},
            )

            # run engine for '_.foo'
            affected = engine.run(self.target_object, hints=['_.foo'])

            # assert ticket was archived
            self.assertEqual(len(affected), 1)
            foo_ticket.refresh_from_db()
            self.assertTrue(foo_ticket.archived)
            intent.refresh_from_db()
            self.assertIsNotNone(intent.attended_at)

            # check there is 1 log related to the archived ticket
            logs = TicketLog.objects.filter(ticket=foo_ticket)
            self.assertEqual(len(logs), 1)
            self.assertEqual(logs.first().meta['description'], Rule.ActionDescription.ARCHIVE)
            self.assertTrue(logs.first().meta['next_archived'])

    def test_unarchiving_a_ticket_by_intent(self):
        with target_controllers.collector.override(TESTS_DIR / "fake_trivial_modules"):
            # run engine to resolve setup intents and events
            engine.run(self.target_object, hints=['_.foo'])

            foo_ticket = self.tickets[0]
            foo_ticket.archived = True
            foo_ticket.save()

            # check there are no logs in ticket yet
            logs = TicketLog.objects.filter(ticket=foo_ticket)
            self.assertEqual(len(logs), 0)

            # create archive intent
            intent = UserIntent.objects.create(
                module="_.foo",
                user=self.superuser_object,
                target=self.target_object,
                content={"archived": False},
            )

            # run engine for '_.foo'
            affected = engine.run(self.target_object, hints=['_.foo'])

            # assert ticket was unarchived
            self.assertEqual(len(affected), 1)
            foo_ticket.refresh_from_db()
            self.assertFalse(foo_ticket.archived)
            intent.refresh_from_db()
            self.assertIsNotNone(intent.attended_at)

            # check there is 1 log related to the unarchived ticket
            logs = TicketLog.objects.filter(ticket=foo_ticket)
            self.assertEqual(len(logs), 1)
            self.assertEqual(logs.first().meta['description'], Rule.ActionDescription.ARCHIVE)
            self.assertFalse(logs.first().meta['next_archived'])

    def test_escalate_conditions_with_visibility(self):
        with target_controllers.collector.override(TESTS_DIR / "fake_trivial_modules"):
            # run engine to resolve setup intents and events
            engine.run(self.target_object, hints=['_.ipsum.sed'])
            # Get ticket _.ipsum sed
            ticket = Ticket.objects.filter(
                module='_.ipsum.sed',
                state="A",
            ).first()

            # Complete conditions for authority
            # create auth request (authority-3 authorization)
            auth_request = AuthorizationRequest.objects.create(
                ticket=ticket,
                authorization='ticket.A.escalate.B.authorization.authority-3'
            )
            # approve request to complete a condition
            auth_request.status = AuthorizationRequest.Status.APPROVED
            auth_request.save()

            # Create authority user intent to escalate to B
            UserIntent.objects.create(
                module='_.ipsum.sed',
                user=self.authority_user_object,
                target=self.target_object,
                content={'state': 'B'},
            )

            # Dry run engine
            affected, _ = engine.dry_run(self.target_object, '_.ipsum.sed')

            # Escalating must work, despite of not completing only_miner visible conditions
            self.assertEqual(len(affected), 1)
            self.assertEqual(affected[0]['id'], ticket.id)
            self.assertEqual(affected[0]['state'], 'B')

            # Create miner user intent to escalate to B
            UserIntent.objects.create(
                module='_.ipsum.sed',
                user=self.mine_user_object,
                target=self.target_object,
                content={'state': 'B'},
            )

            # Run engine
            affected = engine.run(self.target_object, '_.ipsum.sed')

            # Escalating mustn't work, because there are not completed conditions
            self.assertEqual(len(affected), 0)

            # Complete conditions for miner user
            # Add comment to complete a condition
            TicketComment.objects.create(
                ticket=ticket,
                comment_type=TicketComment.CommentType.EVENT_MANAGEMENT
            )
            # create auth request (miner-3 authorization)
            auth_request = AuthorizationRequest.objects.create(
                ticket=ticket,
                authorization='ticket.A.escalate.B.authorization.miner-3'
            )
            # approve request to complete a condition
            auth_request.status = AuthorizationRequest.Status.APPROVED
            auth_request.save()

            # Create miner user intent again to escalate to B
            UserIntent.objects.create(
                module='_.ipsum.sed',
                user=self.mine_user_object,
                target=self.target_object,
                content={'state': 'B'},
            )

            # Run engine
            affected = engine.run(self.target_object, '_.ipsum.sed')

            # Escalating must work, because all conditions are complete
            self.assertEqual(len(affected), 1)
            self.assertEqual(affected[0].id, ticket.id)
            self.assertEqual(affected[0].state, 'B')

    def test_tickets_become_automatically_unevaluable(self):
        with target_controllers.collector.override(TESTS_DIR / "fake_trivial_modules"):
            # run the engine and expect a new ticket for 'bar'
            affected = engine.run(self.target_object)
            bar_ticket = Ticket.objects.filter(
                module=f"g({self.g1.canonical_name}).bar",
                state="A",
            ).first()
            self.assertIn(bar_ticket, affected)
            # delete the associated spread criterion and re-run the engine
            self.timeseries[1][1].data_source_group = None
            self.timeseries[1][1].save()
            self.g1.delete()
            engine.run(self.target_object)
            self.assertTrue(Ticket.objects.filter(pk=bar_ticket.pk, evaluable=False).exists())

    def test_dry_run(self):
        with target_controllers.collector.override(TESTS_DIR / "fake_trivial_modules"):
            # assert the intents are unattended
            self.assertTrue(UserIntent.objects.filter(
                id__in=[intent.id for intent in self.intents],
                attended_at__isnull=True
            ).exists())
            # make a dry run of the engine and expect no changes
            try:
                engine.run(self.target_object, dry=True)
                assert False, "dry run didn't raise exception"
            except engine.DryRunException as e:
                tickets = e.tickets
                intents = e.intents
            # the bar ticket was reported but not created
            bar_ticket = next((t for t in tickets if t["module"] == f"g({self.g1.canonical_name}).bar"), None)
            self.assertNotEqual(bar_ticket, None)
            self.assertFalse(Ticket.objects.filter(pk=bar_ticket["id"]).exists())
            # no user intent is really attended, though they're reported as such
            self.assertSetEqual({i.id for i in self.intents}, {i['id'] for i in intents})
            self.assertTrue(all(i["attended_at"] is not None for i in intents))
            self.assertTrue(UserIntent.objects.filter(
                id__in=[intent["id"] for intent in intents],
                attended_at__isnull=True
            ).exists())

    @with_test_modules
    @patch('alerts.engine._propagate_ticket')
    def test_propagation_sends_message(self, m_pt):
        module = f'g({self.g1.canonical_name}).bar'
        # run engine, bar module will create a ticket because of setup events
        affected = engine.run(self.target_object, hints=[module])

        # new ticket created from event
        ticket = Ticket.objects.filter(module=module).first()
        self.assertIn(ticket, affected)
        self.assertNotIn(ticket, self.tickets)
        self.assertTrue(ticket.propagated)

        # assert _propagate_ticket was called with new ticket
        m_pt.assert_called_once()
        self.assertEqual(len(m_pt.call_args[0]), 1)
        self.assertEqual(m_pt.call_args[0][0].id, ticket.id)

        m_pt.reset_mock()

        # Create a new intent to change ticket level
        UserIntent.objects.create(
            module=module,
            user=self.superuser_object,
            target=self.target_object,
            content={"state": "B"},
        )

        # Add comment to complete conditions
        TicketComment.objects.create(ticket=ticket, comment_type=TicketComment.CommentType.EVENT_MANAGEMENT)

        # run engine, ticket should change to new level set in intent
        engine.run(self.target_object, hints=[module])

        ticket.refresh_from_db()

        self.assertEqual(ticket.state, "B")

        m_pt.assert_called_once()
        self.assertEqual(len(m_pt.call_args[0]), 1)
        self.assertEqual(m_pt.call_args[0][0].id, ticket.id)
