import decimal

from targets.models import DataSource

# template -> (mass, valence, is_cation)
MOL_VALENCE = {
    "emac-mvp.ionic-balance.ca": (decimal.Decimal("40.078"), 2, True),
    "emac-mvp.ionic-balance.na": (decimal.Decimal("22.99"), 1, True),
    "emac-mvp.ionic-balance.k": (decimal.Decimal("39.098"), 1, True),
    "emac-mvp.ionic-balance.mg": (decimal.Decimal("24.305"), 2, True),
    "emac-mvp.variables.sulfates": (decimal.Decimal("96.056"), 2, False),
    "emac-mvp.variables.chloride": (decimal.Decimal("35.45"), 1, False),
    "emac-mvp.ionic-balance.bicarbonates": (decimal.Decimal("61.016"), 1, False),
    "emac-mvp.ionic-balance.carbonates": (decimal.Decimal("60.008"), 2, False),
}


def single_ionic_balance(conformed_values):
    """Computes the ionic balance given a list of single-source conformed
    values.

    """
    heads = {
        template: conformed_values.filter(
            series__template_name=template
        ).order_by("-timestamp").first()
        for template in MOL_VALENCE
    }
    cat_sum = sum(
        conformed.value * MOL_VALENCE[template][1] / MOL_VALENCE[template][0]
        for template, conformed in heads.items()
        if conformed is not None
        if MOL_VALENCE[template][2]
    )
    an_sum = sum(
        conformed.value * MOL_VALENCE[template][1] / MOL_VALENCE[template][0]
        for template, conformed in heads.items()
        if conformed is not None
        if not MOL_VALENCE[template][2]
    )
    if (cat_sum + an_sum) == 0:
        return None
    return abs(100 * (cat_sum - an_sum) / (cat_sum + an_sum))


def ionic_balance(operation):
    """Computes the ionic balance, or None if it can't be computed with
    the given operation. Returns a collection of data sources mapped
    to ionic balance results.

    """
    sources = DataSource.objects.filter(
        timeseries__in=operation.conformed_values.values("series")
    )
    return [
        (
            source,
            single_ionic_balance(
                operation.conformed_values
                .filter(series__in=source.timeseries.all())
            ),
        )
        for source in sources
    ]
