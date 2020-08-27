from alerts.modules.ef.m1.level2.base import Level2BaseController


class Controller(Level2BaseController):

    name = "Deslizamiento superficial de un sector del talud del muro"

    description = (
        "Corresponde a un deslizamiento de la capa superficial del material "
        "del muro en el sector aguas arriba o aguas abajo, se considera que "
        "si aproximadamente un área de 100[m²] se ve afectada es necesario "
        "activar este evento gatillador."
    )

    timeseries_templates = (
        "ef-mvp.m1.triggers.deslizamiento-menor",
    )
