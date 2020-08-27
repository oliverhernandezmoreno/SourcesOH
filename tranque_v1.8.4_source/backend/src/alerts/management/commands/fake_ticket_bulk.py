import random

from django.core.management.base import BaseCommand
from alerts import engine
from alerts.models import Ticket
from targets.models import Target


class Command(BaseCommand):
    help = "Creates a fake ticket to test"

    MODULES = [
        {"module": "_.ef.m1.inspeccion_mensual.situacion_actual_deposito", "validStates": ["B1"]},
        {"module": "_.ef.m1.level2.terremoto-4-6", "validStates": ["B", "C", "D"]},
        {"module": "_.ef.m1.level2.deslizamiento-menor", "validStates": ["B", "C", "D"]},
        {"module": "_.ef.m1_m2.altura_coronamiento.A3", "validStates": ["A3"]},
        {"module": "_.ef.m1_m2.pendiente_muro.A1", "validStates": ["A1"]},
        {"module": "_.ef.m1_m2.revancha_operacional.A1", "validStates": ["A1"]},
        {"module": "_.ef.m1_m2.distancia_minima_muro_laguna.B1", "validStates": ["B1"]},
        {"module": "_.ef.m1_m2.revancha_hidraulica.B", "validStates": ["B1", "B2", "B3"]},
        {"module": "_.ef.m1_m2.revancha_hidraulica.A1", "validStates": ["A1"]},
        {"module": "_.ef.m2.intensidad_lluvia", "validStates": ["B1", "C", "D"]},
    ]

    def get_ticket_state(self, level):
        return self.TICKET_TYPES[level-1]

    def add_arguments(self, parser):
        parser.add_argument(
            "numberTickets",
            help="Number of tickets to generate",
        )

    def handle(self, *args, **kwargs):
        targetSet = set()
        print("# Created tickets ids")
        for i in range(int(kwargs['numberTickets'])):
            if (i == 0 or random.randrange(10) < 3):
                target = Target.objects.all()[random.randrange(len(Target.objects.all()))]

            targetTickets = Ticket.objects.filter(target__canonical_name=target.canonical_name)
            targetTicketsModulesSet = [t.module for t in targetTickets]
            chosableModules = [m['module'] for m in self.MODULES if m['module'] not in targetTicketsModulesSet]
            while not chosableModules:
                target = Target.objects.all()[random.randrange(len(Target.objects.all()))]
                targetTickets = Ticket.objects.filter(target__canonical_name=target.canonical_name)
                targetTicketsModulesSet = [t.module for t in targetTickets]
                chosableModules = [m['module'] for m in self.MODULES if m['module'] not in targetTicketsModulesSet]

            targetSet.add(target)
            randomModule = chosableModules.pop(random.randrange(len(chosableModules)))
            randomModuleTokens = randomModule.split(".")

            validStates = next(m['validStates'] for m in self.MODULES if m['module'] == randomModule)
            state = validStates[random.randrange(len(validStates))]

            # TODO
            spread_object = {}

            mRandom = random.randrange(10)
            archived = True if (mRandom >= 7) else False
            evaluable = True if (mRandom >= 2) else False

            groups = "/"+randomModuleTokens[1]+"/mine/authority/"

            t = Ticket.objects.create(
                module=randomModule, state=state, target=target,
                archived=archived, evaluable=evaluable,
                spread_object=spread_object, groups=groups
            )
            print(t.id)

        print("# Runing engine for targets wich have new tickets")
        for target in targetSet:
            engine.run(target)
