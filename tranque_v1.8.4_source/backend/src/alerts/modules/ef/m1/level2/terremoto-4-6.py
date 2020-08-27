from alerts.modules.ef.m1.level2.base import Level2BaseController


class Controller(Level2BaseController):

    name = "Terremoto"

    description = (
        "Corresponde a un sismo menor, que puede ser detectado por un "
        "operador pero que no genera un movimiento lo suficientemente fuerte "
        "como para que el operador pierda su estabilidad y no pueda mantenerse "
        "en pie."
    )

    timeseries_templates = (
        "ef-mvp.m1.triggers.important.terremoto-4-6",
    )
