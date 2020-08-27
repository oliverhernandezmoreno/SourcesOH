Important note:

modules test run with `settings.STACK_IS_SML=True` will run without triggering alerts tickets,
because alerts tickets are created only on SMCs

for simplicity in testing, only alert test should run with `settings.STACK_IS_SML=False`
