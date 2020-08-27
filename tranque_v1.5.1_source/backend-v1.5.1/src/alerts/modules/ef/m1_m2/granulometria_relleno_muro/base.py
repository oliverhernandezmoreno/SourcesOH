from alerts.modules.ef.ef_event import EFEventController

PROFILE_DESCRIPTIONS = {
    'A1': 'Se detecta que la curva granulométrica de las arenas no cumple \
    según los criterios de diseño.',
    'B1': 'Se activó el evento asociado a la desviación con respecto al \
    diseño “Materiales apropiados”',
    'B2': 'Porcentaje de finos < Valor umbral',
}


class GranulometriaRellenoMuroController(EFEventController):
    name = "Granulometría del material de relleno del muro"

    visibility_groups = (
        "ef",
        "m1",
        "ef.m1_m2",
        "ef.m1_m2.granulometria_relleno_muro",
        "mine"
    )

    def result_state(self, ticket):
        if ticket.state == self.CLOSED_STATE:
            return self.no_result_state
        return {
            "level": self.get_level(ticket),
            "short_message": self.name,
            "message": PROFILE_DESCRIPTIONS.get(ticket.state, ''),
            "reason": "exceed",
            "parameter": "inspections"
        }
