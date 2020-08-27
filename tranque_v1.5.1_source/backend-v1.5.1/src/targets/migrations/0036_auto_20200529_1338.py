# Generated by Django 2.2.12 on 2020-05-29 13:38

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('targets', '0035_auto_20200523_0135'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='target',
            options={'ordering': ['canonical_name'], 'permissions': [('reportforms.form.case.comment', 'Add form case comment'), ('reportforms.form.case.create', 'Add form case'), ('reportforms.form.case.read', 'Read form case'), ('reportforms.form.case.reassign', 'Reassign form instance from case'), ('reportforms.form.case.update', 'Update form case'), ('reportforms.form.create', 'Assign form to target'), ('reportforms.form.edit', 'Answer form'), ('reportforms.form.read', 'Read form'), ('reportforms.form.reassign.request', 'Request form reassignment'), ('reportforms.form.reassign.resolve', 'Resolve form reassignment'), ('reportforms.form.review', 'Review form answers, read and add comments'), ('reportforms.form.send', 'Send form for reviewing'), ('reportforms.form.validate', 'Validate form answer'), ('ticket.A.archive', 'archive A'), ('ticket.A.archive.authorization.authority-2.read', 'Read authorization authority-2 to archive A'), ('ticket.A.archive.authorization.authority-2.request', 'Request authorization authority-2 to archive A'), ('ticket.A.archive.authorization.authority-2.resolve', 'Resolve authorization authority-2 to archive A'), ('ticket.A.archive.authorization.authority-3.read', 'Read authorization authority-3 to archive A'), ('ticket.A.archive.authorization.authority-3.request', 'Request authorization authority-3 to archive A'), ('ticket.A.archive.authorization.authority-3.resolve', 'Resolve authorization authority-3 to archive A'), ('ticket.A.archive.authorization.miner-2.read', 'Read authorization miner-2 to archive A'), ('ticket.A.archive.authorization.miner-2.request', 'Request authorization miner-2 to archive A'), ('ticket.A.archive.authorization.miner-2.resolve', 'Resolve authorization miner-2 to archive A'), ('ticket.A.archive.authorization.miner-3.read', 'Read authorization miner-3 to archive A'), ('ticket.A.archive.authorization.miner-3.request', 'Request authorization miner-3 to archive A'), ('ticket.A.archive.authorization.miner-3.resolve', 'Resolve authorization miner-3 to archive A'), ('ticket.A.children.read', 'Read children tickets from tickets "A"'), ('ticket.A.close', 'close A'), ('ticket.A.close.authorization.authority-2.read', 'Read authorization authority-2 to close A'), ('ticket.A.close.authorization.authority-2.request', 'Request authorization authority-2 to close A'), ('ticket.A.close.authorization.authority-2.resolve', 'Resolve authorization authority-2 to close A'), ('ticket.A.close.authorization.authority-3.read', 'Read authorization authority-3 to close A'), ('ticket.A.close.authorization.authority-3.request', 'Request authorization authority-3 to close A'), ('ticket.A.close.authorization.authority-3.resolve', 'Resolve authorization authority-3 to close A'), ('ticket.A.close.authorization.miner-2.read', 'Read authorization miner-2 to close A'), ('ticket.A.close.authorization.miner-2.request', 'Request authorization miner-2 to close A'), ('ticket.A.close.authorization.miner-2.resolve', 'Resolve authorization miner-2 to close A'), ('ticket.A.close.authorization.miner-3.read', 'Read authorization miner-3 to close A'), ('ticket.A.close.authorization.miner-3.request', 'Request authorization miner-3 to close A'), ('ticket.A.close.authorization.miner-3.resolve', 'Resolve authorization miner-3 to close A'), ('ticket.A.escalate.B', 'Escalate from A to B'), ('ticket.A.escalate.B.authorization.authority-2.read', 'Read authorization authority-2 to escalate from A to B'), ('ticket.A.escalate.B.authorization.authority-2.request', 'Request authorization authority-2 to escalate from A to B'), ('ticket.A.escalate.B.authorization.authority-2.resolve', 'Resolve authorization authority-2 to escalate from A to B'), ('ticket.A.escalate.B.authorization.authority-3.read', 'Read authorization authority-3 to escalate from A to B'), ('ticket.A.escalate.B.authorization.authority-3.request', 'Request authorization authority-3 to escalate from A to B'), ('ticket.A.escalate.B.authorization.authority-3.resolve', 'Resolve authorization authority-3 to escalate from A to B'), ('ticket.A.escalate.B.authorization.miner-2.read', 'Read authorization miner-2 to escalate from A to B'), ('ticket.A.escalate.B.authorization.miner-2.request', 'Request authorization miner-2 to escalate from A to B'), ('ticket.A.escalate.B.authorization.miner-2.resolve', 'Resolve authorization miner-2 to escalate from A to B'), ('ticket.A.escalate.B.authorization.miner-3.read', 'Read authorization miner-3 to escalate from A to B'), ('ticket.A.escalate.B.authorization.miner-3.request', 'Request authorization miner-3 to escalate from A to B'), ('ticket.A.escalate.B.authorization.miner-3.resolve', 'Resolve authorization miner-3 to escalate from A to B'), ('ticket.A.escalate.C', 'Escalate from A to C'), ('ticket.A.escalate.C.authorization.authority-2.read', 'Read authorization authority-2 to escalate from A to C'), ('ticket.A.escalate.C.authorization.authority-2.request', 'Request authorization authority-2 to escalate from A to C'), ('ticket.A.escalate.C.authorization.authority-2.resolve', 'Resolve authorization authority-2 to escalate from A to C'), ('ticket.A.escalate.C.authorization.authority-3.read', 'Read authorization authority-3 to escalate from A to C'), ('ticket.A.escalate.C.authorization.authority-3.request', 'Request authorization authority-3 to escalate from A to C'), ('ticket.A.escalate.C.authorization.authority-3.resolve', 'Resolve authorization authority-3 to escalate from A to C'), ('ticket.A.escalate.C.authorization.miner-2.read', 'Read authorization miner-2 to escalate from A to C'), ('ticket.A.escalate.C.authorization.miner-2.request', 'Request authorization miner-2 to escalate from A to C'), ('ticket.A.escalate.C.authorization.miner-2.resolve', 'Resolve authorization miner-2 to escalate from A to C'), ('ticket.A.escalate.C.authorization.miner-3.read', 'Read authorization miner-3 to escalate from A to C'), ('ticket.A.escalate.C.authorization.miner-3.request', 'Request authorization miner-3 to escalate from A to C'), ('ticket.A.escalate.C.authorization.miner-3.resolve', 'Resolve authorization miner-3 to escalate from A to C'), ('ticket.A.escalate.D', 'Escalate from A to D'), ('ticket.A.escalate.D.authorization.authority-2.read', 'Read authorization authority-2 to escalate from A to D'), ('ticket.A.escalate.D.authorization.authority-2.request', 'Request authorization authority-2 to escalate from A to D'), ('ticket.A.escalate.D.authorization.authority-2.resolve', 'Resolve authorization authority-2 to escalate from A to D'), ('ticket.A.escalate.D.authorization.authority-3.read', 'Read authorization authority-3 to escalate from A to D'), ('ticket.A.escalate.D.authorization.authority-3.request', 'Request authorization authority-3 to escalate from A to D'), ('ticket.A.escalate.D.authorization.authority-3.resolve', 'Resolve authorization authority-3 to escalate from A to D'), ('ticket.A.escalate.D.authorization.miner-2.read', 'Read authorization miner-2 to escalate from A to D'), ('ticket.A.escalate.D.authorization.miner-2.request', 'Request authorization miner-2 to escalate from A to D'), ('ticket.A.escalate.D.authorization.miner-2.resolve', 'Resolve authorization miner-2 to escalate from A to D'), ('ticket.A.escalate.D.authorization.miner-3.read', 'Read authorization miner-3 to escalate from A to D'), ('ticket.A.escalate.D.authorization.miner-3.request', 'Request authorization miner-3 to escalate from A to D'), ('ticket.A.escalate.D.authorization.miner-3.resolve', 'Resolve authorization miner-3 to escalate from A to D'), ('ticket.A.event_data.read', 'Read related events from tickets "A"'), ('ticket.A.event_management_comment.read', 'Read event management data for state A'), ('ticket.A.event_management_comment.write', 'Add event management data for state A'), ('ticket.A.log.read', 'Read logs from tickets "A"'), ('ticket.A.log.write', 'Write logs from tickets "A"'), ('ticket.A.read', 'Read basic data from tickets "A"'), ('ticket.B.archive', 'archive B'), ('ticket.B.archive.authorization.authority-2.read', 'Read authorization authority-2 to archive B'), ('ticket.B.archive.authorization.authority-2.request', 'Request authorization authority-2 to archive B'), ('ticket.B.archive.authorization.authority-2.resolve', 'Resolve authorization authority-2 to archive B'), ('ticket.B.archive.authorization.authority-3.read', 'Read authorization authority-3 to archive B'), ('ticket.B.archive.authorization.authority-3.request', 'Request authorization authority-3 to archive B'), ('ticket.B.archive.authorization.authority-3.resolve', 'Resolve authorization authority-3 to archive B'), ('ticket.B.archive.authorization.miner-2.read', 'Read authorization miner-2 to archive B'), ('ticket.B.archive.authorization.miner-2.request', 'Request authorization miner-2 to archive B'), ('ticket.B.archive.authorization.miner-2.resolve', 'Resolve authorization miner-2 to archive B'), ('ticket.B.archive.authorization.miner-3.read', 'Read authorization miner-3 to archive B'), ('ticket.B.archive.authorization.miner-3.request', 'Request authorization miner-3 to archive B'), ('ticket.B.archive.authorization.miner-3.resolve', 'Resolve authorization miner-3 to archive B'), ('ticket.B.children.read', 'Read children tickets from tickets "B"'), ('ticket.B.close', 'close B'), ('ticket.B.close.authorization.authority-2.read', 'Read authorization authority-2 to close B'), ('ticket.B.close.authorization.authority-2.request', 'Request authorization authority-2 to close B'), ('ticket.B.close.authorization.authority-2.resolve', 'Resolve authorization authority-2 to close B'), ('ticket.B.close.authorization.authority-3.read', 'Read authorization authority-3 to close B'), ('ticket.B.close.authorization.authority-3.request', 'Request authorization authority-3 to close B'), ('ticket.B.close.authorization.authority-3.resolve', 'Resolve authorization authority-3 to close B'), ('ticket.B.close.authorization.miner-2.read', 'Read authorization miner-2 to close B'), ('ticket.B.close.authorization.miner-2.request', 'Request authorization miner-2 to close B'), ('ticket.B.close.authorization.miner-2.resolve', 'Resolve authorization miner-2 to close B'), ('ticket.B.close.authorization.miner-3.read', 'Read authorization miner-3 to close B'), ('ticket.B.close.authorization.miner-3.request', 'Request authorization miner-3 to close B'), ('ticket.B.close.authorization.miner-3.resolve', 'Resolve authorization miner-3 to close B'), ('ticket.B.escalate.A', 'Escalate from B to A'), ('ticket.B.escalate.A.authorization.authority-2.read', 'Read authorization authority-2 to escalate from B to A'), ('ticket.B.escalate.A.authorization.authority-2.request', 'Request authorization authority-2 to escalate from B to A'), ('ticket.B.escalate.A.authorization.authority-2.resolve', 'Resolve authorization authority-2 to escalate from B to A'), ('ticket.B.escalate.A.authorization.authority-3.read', 'Read authorization authority-3 to escalate from B to A'), ('ticket.B.escalate.A.authorization.authority-3.request', 'Request authorization authority-3 to escalate from B to A'), ('ticket.B.escalate.A.authorization.authority-3.resolve', 'Resolve authorization authority-3 to escalate from B to A'), ('ticket.B.escalate.A.authorization.miner-2.read', 'Read authorization miner-2 to escalate from B to A'), ('ticket.B.escalate.A.authorization.miner-2.request', 'Request authorization miner-2 to escalate from B to A'), ('ticket.B.escalate.A.authorization.miner-2.resolve', 'Resolve authorization miner-2 to escalate from B to A'), ('ticket.B.escalate.A.authorization.miner-3.read', 'Read authorization miner-3 to escalate from B to A'), ('ticket.B.escalate.A.authorization.miner-3.request', 'Request authorization miner-3 to escalate from B to A'), ('ticket.B.escalate.A.authorization.miner-3.resolve', 'Resolve authorization miner-3 to escalate from B to A'), ('ticket.B.escalate.C', 'Escalate from B to C'), ('ticket.B.escalate.C.authorization.authority-2.read', 'Read authorization authority-2 to escalate from B to C'), ('ticket.B.escalate.C.authorization.authority-2.request', 'Request authorization authority-2 to escalate from B to C'), ('ticket.B.escalate.C.authorization.authority-2.resolve', 'Resolve authorization authority-2 to escalate from B to C'), ('ticket.B.escalate.C.authorization.authority-3.read', 'Read authorization authority-3 to escalate from B to C'), ('ticket.B.escalate.C.authorization.authority-3.request', 'Request authorization authority-3 to escalate from B to C'), ('ticket.B.escalate.C.authorization.authority-3.resolve', 'Resolve authorization authority-3 to escalate from B to C'), ('ticket.B.escalate.C.authorization.miner-2.read', 'Read authorization miner-2 to escalate from B to C'), ('ticket.B.escalate.C.authorization.miner-2.request', 'Request authorization miner-2 to escalate from B to C'), ('ticket.B.escalate.C.authorization.miner-2.resolve', 'Resolve authorization miner-2 to escalate from B to C'), ('ticket.B.escalate.C.authorization.miner-3.read', 'Read authorization miner-3 to escalate from B to C'), ('ticket.B.escalate.C.authorization.miner-3.request', 'Request authorization miner-3 to escalate from B to C'), ('ticket.B.escalate.C.authorization.miner-3.resolve', 'Resolve authorization miner-3 to escalate from B to C'), ('ticket.B.escalate.D', 'Escalate from B to D'), ('ticket.B.escalate.D.authorization.authority-2.read', 'Read authorization authority-2 to escalate from B to D'), ('ticket.B.escalate.D.authorization.authority-2.request', 'Request authorization authority-2 to escalate from B to D'), ('ticket.B.escalate.D.authorization.authority-2.resolve', 'Resolve authorization authority-2 to escalate from B to D'), ('ticket.B.escalate.D.authorization.authority-3.read', 'Read authorization authority-3 to escalate from B to D'), ('ticket.B.escalate.D.authorization.authority-3.request', 'Request authorization authority-3 to escalate from B to D'), ('ticket.B.escalate.D.authorization.authority-3.resolve', 'Resolve authorization authority-3 to escalate from B to D'), ('ticket.B.escalate.D.authorization.miner-2.read', 'Read authorization miner-2 to escalate from B to D'), ('ticket.B.escalate.D.authorization.miner-2.request', 'Request authorization miner-2 to escalate from B to D'), ('ticket.B.escalate.D.authorization.miner-2.resolve', 'Resolve authorization miner-2 to escalate from B to D'), ('ticket.B.escalate.D.authorization.miner-3.read', 'Read authorization miner-3 to escalate from B to D'), ('ticket.B.escalate.D.authorization.miner-3.request', 'Request authorization miner-3 to escalate from B to D'), ('ticket.B.escalate.D.authorization.miner-3.resolve', 'Resolve authorization miner-3 to escalate from B to D'), ('ticket.B.event_data.read', 'Read related events from tickets "B"'), ('ticket.B.event_management_comment.read', 'Read event management data for state B'), ('ticket.B.event_management_comment.write', 'Add event management data for state B'), ('ticket.B.log.read', 'Read logs from tickets "B"'), ('ticket.B.log.write', 'Write logs from tickets "B"'), ('ticket.B.read', 'Read basic data from tickets "B"'), ('ticket.C.archive', 'archive C'), ('ticket.C.archive.authorization.authority-2.read', 'Read authorization authority-2 to archive C'), ('ticket.C.archive.authorization.authority-2.request', 'Request authorization authority-2 to archive C'), ('ticket.C.archive.authorization.authority-2.resolve', 'Resolve authorization authority-2 to archive C'), ('ticket.C.archive.authorization.authority-3.read', 'Read authorization authority-3 to archive C'), ('ticket.C.archive.authorization.authority-3.request', 'Request authorization authority-3 to archive C'), ('ticket.C.archive.authorization.authority-3.resolve', 'Resolve authorization authority-3 to archive C'), ('ticket.C.archive.authorization.miner-2.read', 'Read authorization miner-2 to archive C'), ('ticket.C.archive.authorization.miner-2.request', 'Request authorization miner-2 to archive C'), ('ticket.C.archive.authorization.miner-2.resolve', 'Resolve authorization miner-2 to archive C'), ('ticket.C.archive.authorization.miner-3.read', 'Read authorization miner-3 to archive C'), ('ticket.C.archive.authorization.miner-3.request', 'Request authorization miner-3 to archive C'), ('ticket.C.archive.authorization.miner-3.resolve', 'Resolve authorization miner-3 to archive C'), ('ticket.C.children.read', 'Read children tickets from tickets "C"'), ('ticket.C.close', 'close C'), ('ticket.C.close.authorization.authority-2.read', 'Read authorization authority-2 to close C'), ('ticket.C.close.authorization.authority-2.request', 'Request authorization authority-2 to close C'), ('ticket.C.close.authorization.authority-2.resolve', 'Resolve authorization authority-2 to close C'), ('ticket.C.close.authorization.authority-3.read', 'Read authorization authority-3 to close C'), ('ticket.C.close.authorization.authority-3.request', 'Request authorization authority-3 to close C'), ('ticket.C.close.authorization.authority-3.resolve', 'Resolve authorization authority-3 to close C'), ('ticket.C.close.authorization.miner-2.read', 'Read authorization miner-2 to close C'), ('ticket.C.close.authorization.miner-2.request', 'Request authorization miner-2 to close C'), ('ticket.C.close.authorization.miner-2.resolve', 'Resolve authorization miner-2 to close C'), ('ticket.C.close.authorization.miner-3.read', 'Read authorization miner-3 to close C'), ('ticket.C.close.authorization.miner-3.request', 'Request authorization miner-3 to close C'), ('ticket.C.close.authorization.miner-3.resolve', 'Resolve authorization miner-3 to close C'), ('ticket.C.escalate.A', 'Escalate from C to A'), ('ticket.C.escalate.A.authorization.authority-2.read', 'Read authorization authority-2 to escalate from C to A'), ('ticket.C.escalate.A.authorization.authority-2.request', 'Request authorization authority-2 to escalate from C to A'), ('ticket.C.escalate.A.authorization.authority-2.resolve', 'Resolve authorization authority-2 to escalate from C to A'), ('ticket.C.escalate.A.authorization.authority-3.read', 'Read authorization authority-3 to escalate from C to A'), ('ticket.C.escalate.A.authorization.authority-3.request', 'Request authorization authority-3 to escalate from C to A'), ('ticket.C.escalate.A.authorization.authority-3.resolve', 'Resolve authorization authority-3 to escalate from C to A'), ('ticket.C.escalate.A.authorization.miner-2.read', 'Read authorization miner-2 to escalate from C to A'), ('ticket.C.escalate.A.authorization.miner-2.request', 'Request authorization miner-2 to escalate from C to A'), ('ticket.C.escalate.A.authorization.miner-2.resolve', 'Resolve authorization miner-2 to escalate from C to A'), ('ticket.C.escalate.A.authorization.miner-3.read', 'Read authorization miner-3 to escalate from C to A'), ('ticket.C.escalate.A.authorization.miner-3.request', 'Request authorization miner-3 to escalate from C to A'), ('ticket.C.escalate.A.authorization.miner-3.resolve', 'Resolve authorization miner-3 to escalate from C to A'), ('ticket.C.escalate.B', 'Escalate from C to B'), ('ticket.C.escalate.B.authorization.authority-2.read', 'Read authorization authority-2 to escalate from C to B'), ('ticket.C.escalate.B.authorization.authority-2.request', 'Request authorization authority-2 to escalate from C to B'), ('ticket.C.escalate.B.authorization.authority-2.resolve', 'Resolve authorization authority-2 to escalate from C to B'), ('ticket.C.escalate.B.authorization.authority-3.read', 'Read authorization authority-3 to escalate from C to B'), ('ticket.C.escalate.B.authorization.authority-3.request', 'Request authorization authority-3 to escalate from C to B'), ('ticket.C.escalate.B.authorization.authority-3.resolve', 'Resolve authorization authority-3 to escalate from C to B'), ('ticket.C.escalate.B.authorization.miner-2.read', 'Read authorization miner-2 to escalate from C to B'), ('ticket.C.escalate.B.authorization.miner-2.request', 'Request authorization miner-2 to escalate from C to B'), ('ticket.C.escalate.B.authorization.miner-2.resolve', 'Resolve authorization miner-2 to escalate from C to B'), ('ticket.C.escalate.B.authorization.miner-3.read', 'Read authorization miner-3 to escalate from C to B'), ('ticket.C.escalate.B.authorization.miner-3.request', 'Request authorization miner-3 to escalate from C to B'), ('ticket.C.escalate.B.authorization.miner-3.resolve', 'Resolve authorization miner-3 to escalate from C to B'), ('ticket.C.escalate.D', 'Escalate from C to D'), ('ticket.C.escalate.D.authorization.authority-2.read', 'Read authorization authority-2 to escalate from C to D'), ('ticket.C.escalate.D.authorization.authority-2.request', 'Request authorization authority-2 to escalate from C to D'), ('ticket.C.escalate.D.authorization.authority-2.resolve', 'Resolve authorization authority-2 to escalate from C to D'), ('ticket.C.escalate.D.authorization.authority-3.read', 'Read authorization authority-3 to escalate from C to D'), ('ticket.C.escalate.D.authorization.authority-3.request', 'Request authorization authority-3 to escalate from C to D'), ('ticket.C.escalate.D.authorization.authority-3.resolve', 'Resolve authorization authority-3 to escalate from C to D'), ('ticket.C.escalate.D.authorization.miner-2.read', 'Read authorization miner-2 to escalate from C to D'), ('ticket.C.escalate.D.authorization.miner-2.request', 'Request authorization miner-2 to escalate from C to D'), ('ticket.C.escalate.D.authorization.miner-2.resolve', 'Resolve authorization miner-2 to escalate from C to D'), ('ticket.C.escalate.D.authorization.miner-3.read', 'Read authorization miner-3 to escalate from C to D'), ('ticket.C.escalate.D.authorization.miner-3.request', 'Request authorization miner-3 to escalate from C to D'), ('ticket.C.escalate.D.authorization.miner-3.resolve', 'Resolve authorization miner-3 to escalate from C to D'), ('ticket.C.event_data.read', 'Read related events from tickets "C"'), ('ticket.C.event_management_comment.read', 'Read event management data for state C'), ('ticket.C.event_management_comment.write', 'Add event management data for state C'), ('ticket.C.log.read', 'Read logs from tickets "C"'), ('ticket.C.log.write', 'Write logs from tickets "C"'), ('ticket.C.read', 'Read basic data from tickets "C"'), ('ticket.D.archive', 'archive D'), ('ticket.D.archive.authorization.authority-2.read', 'Read authorization authority-2 to archive D'), ('ticket.D.archive.authorization.authority-2.request', 'Request authorization authority-2 to archive D'), ('ticket.D.archive.authorization.authority-2.resolve', 'Resolve authorization authority-2 to archive D'), ('ticket.D.archive.authorization.authority-3.read', 'Read authorization authority-3 to archive D'), ('ticket.D.archive.authorization.authority-3.request', 'Request authorization authority-3 to archive D'), ('ticket.D.archive.authorization.authority-3.resolve', 'Resolve authorization authority-3 to archive D'), ('ticket.D.archive.authorization.miner-2.read', 'Read authorization miner-2 to archive D'), ('ticket.D.archive.authorization.miner-2.request', 'Request authorization miner-2 to archive D'), ('ticket.D.archive.authorization.miner-2.resolve', 'Resolve authorization miner-2 to archive D'), ('ticket.D.archive.authorization.miner-3.read', 'Read authorization miner-3 to archive D'), ('ticket.D.archive.authorization.miner-3.request', 'Request authorization miner-3 to archive D'), ('ticket.D.archive.authorization.miner-3.resolve', 'Resolve authorization miner-3 to archive D'), ('ticket.D.children.read', 'Read children tickets from tickets "D"'), ('ticket.D.close', 'close D'), ('ticket.D.close.authorization.authority-2.read', 'Read authorization authority-2 to close D'), ('ticket.D.close.authorization.authority-2.request', 'Request authorization authority-2 to close D'), ('ticket.D.close.authorization.authority-2.resolve', 'Resolve authorization authority-2 to close D'), ('ticket.D.close.authorization.authority-3.read', 'Read authorization authority-3 to close D'), ('ticket.D.close.authorization.authority-3.request', 'Request authorization authority-3 to close D'), ('ticket.D.close.authorization.authority-3.resolve', 'Resolve authorization authority-3 to close D'), ('ticket.D.close.authorization.miner-2.read', 'Read authorization miner-2 to close D'), ('ticket.D.close.authorization.miner-2.request', 'Request authorization miner-2 to close D'), ('ticket.D.close.authorization.miner-2.resolve', 'Resolve authorization miner-2 to close D'), ('ticket.D.close.authorization.miner-3.read', 'Read authorization miner-3 to close D'), ('ticket.D.close.authorization.miner-3.request', 'Request authorization miner-3 to close D'), ('ticket.D.close.authorization.miner-3.resolve', 'Resolve authorization miner-3 to close D'), ('ticket.D.escalate.A', 'Escalate from D to A'), ('ticket.D.escalate.A.authorization.authority-2.read', 'Read authorization authority-2 to escalate from D to A'), ('ticket.D.escalate.A.authorization.authority-2.request', 'Request authorization authority-2 to escalate from D to A'), ('ticket.D.escalate.A.authorization.authority-2.resolve', 'Resolve authorization authority-2 to escalate from D to A'), ('ticket.D.escalate.A.authorization.authority-3.read', 'Read authorization authority-3 to escalate from D to A'), ('ticket.D.escalate.A.authorization.authority-3.request', 'Request authorization authority-3 to escalate from D to A'), ('ticket.D.escalate.A.authorization.authority-3.resolve', 'Resolve authorization authority-3 to escalate from D to A'), ('ticket.D.escalate.A.authorization.miner-2.read', 'Read authorization miner-2 to escalate from D to A'), ('ticket.D.escalate.A.authorization.miner-2.request', 'Request authorization miner-2 to escalate from D to A'), ('ticket.D.escalate.A.authorization.miner-2.resolve', 'Resolve authorization miner-2 to escalate from D to A'), ('ticket.D.escalate.A.authorization.miner-3.read', 'Read authorization miner-3 to escalate from D to A'), ('ticket.D.escalate.A.authorization.miner-3.request', 'Request authorization miner-3 to escalate from D to A'), ('ticket.D.escalate.A.authorization.miner-3.resolve', 'Resolve authorization miner-3 to escalate from D to A'), ('ticket.D.escalate.B', 'Escalate from D to B'), ('ticket.D.escalate.B.authorization.authority-2.read', 'Read authorization authority-2 to escalate from D to B'), ('ticket.D.escalate.B.authorization.authority-2.request', 'Request authorization authority-2 to escalate from D to B'), ('ticket.D.escalate.B.authorization.authority-2.resolve', 'Resolve authorization authority-2 to escalate from D to B'), ('ticket.D.escalate.B.authorization.authority-3.read', 'Read authorization authority-3 to escalate from D to B'), ('ticket.D.escalate.B.authorization.authority-3.request', 'Request authorization authority-3 to escalate from D to B'), ('ticket.D.escalate.B.authorization.authority-3.resolve', 'Resolve authorization authority-3 to escalate from D to B'), ('ticket.D.escalate.B.authorization.miner-2.read', 'Read authorization miner-2 to escalate from D to B'), ('ticket.D.escalate.B.authorization.miner-2.request', 'Request authorization miner-2 to escalate from D to B'), ('ticket.D.escalate.B.authorization.miner-2.resolve', 'Resolve authorization miner-2 to escalate from D to B'), ('ticket.D.escalate.B.authorization.miner-3.read', 'Read authorization miner-3 to escalate from D to B'), ('ticket.D.escalate.B.authorization.miner-3.request', 'Request authorization miner-3 to escalate from D to B'), ('ticket.D.escalate.B.authorization.miner-3.resolve', 'Resolve authorization miner-3 to escalate from D to B'), ('ticket.D.escalate.C', 'Escalate from D to C'), ('ticket.D.escalate.C.authorization.authority-2.read', 'Read authorization authority-2 to escalate from D to C'), ('ticket.D.escalate.C.authorization.authority-2.request', 'Request authorization authority-2 to escalate from D to C'), ('ticket.D.escalate.C.authorization.authority-2.resolve', 'Resolve authorization authority-2 to escalate from D to C'), ('ticket.D.escalate.C.authorization.authority-3.read', 'Read authorization authority-3 to escalate from D to C'), ('ticket.D.escalate.C.authorization.authority-3.request', 'Request authorization authority-3 to escalate from D to C'), ('ticket.D.escalate.C.authorization.authority-3.resolve', 'Resolve authorization authority-3 to escalate from D to C'), ('ticket.D.escalate.C.authorization.miner-2.read', 'Read authorization miner-2 to escalate from D to C'), ('ticket.D.escalate.C.authorization.miner-2.request', 'Request authorization miner-2 to escalate from D to C'), ('ticket.D.escalate.C.authorization.miner-2.resolve', 'Resolve authorization miner-2 to escalate from D to C'), ('ticket.D.escalate.C.authorization.miner-3.read', 'Read authorization miner-3 to escalate from D to C'), ('ticket.D.escalate.C.authorization.miner-3.request', 'Request authorization miner-3 to escalate from D to C'), ('ticket.D.escalate.C.authorization.miner-3.resolve', 'Resolve authorization miner-3 to escalate from D to C'), ('ticket.D.event_data.read', 'Read related events from tickets "D"'), ('ticket.D.event_management_comment.read', 'Read event management data for state D'), ('ticket.D.event_management_comment.write', 'Add event management data for state D'), ('ticket.D.log.read', 'Read logs from tickets "D"'), ('ticket.D.log.write', 'Write logs from tickets "D"'), ('ticket.D.read', 'Read basic data from tickets "D"'), ('ticket.RED.alert_complementary_comment.read', 'Read complementary alert data for state RED'), ('ticket.RED.alert_complementary_comment.write', 'Add complementary alert data for state RED'), ('ticket.RED.alert_management_comment.read', 'Read alert management information for state RED'), ('ticket.RED.alert_management_comment.write', 'Add alert management information for state RED'), ('ticket.RED.archive', 'archive RED'), ('ticket.RED.archive.authorization.authority-2.read', 'Read authorization authority-2 to archive RED'), ('ticket.RED.archive.authorization.authority-2.request', 'Request authorization authority-2 to archive RED'), ('ticket.RED.archive.authorization.authority-2.resolve', 'Resolve authorization authority-2 to archive RED'), ('ticket.RED.archive.authorization.authority-3.read', 'Read authorization authority-3 to archive RED'), ('ticket.RED.archive.authorization.authority-3.request', 'Request authorization authority-3 to archive RED'), ('ticket.RED.archive.authorization.authority-3.resolve', 'Resolve authorization authority-3 to archive RED'), ('ticket.RED.children.read', 'Read children tickets from tickets "RED"'), ('ticket.RED.close', 'close RED'), ('ticket.RED.close.authorization.authority-2.read', 'Read authorization authority-2 to close RED'), ('ticket.RED.close.authorization.authority-2.request', 'Request authorization authority-2 to close RED'), ('ticket.RED.close.authorization.authority-2.resolve', 'Resolve authorization authority-2 to close RED'), ('ticket.RED.close.authorization.authority-3.read', 'Read authorization authority-3 to close RED'), ('ticket.RED.close.authorization.authority-3.request', 'Request authorization authority-3 to close RED'), ('ticket.RED.close.authorization.authority-3.resolve', 'Resolve authorization authority-3 to close RED'), ('ticket.RED.close_report_comment.read', 'Read close report for state RED'), ('ticket.RED.close_report_comment.write', 'Add close report for state RED'), ('ticket.RED.escalate.YELLOW', 'Escalate from RED to YELLOW'), ('ticket.RED.escalate.YELLOW.authorization.authority-2.read', 'Read authorization authority-2 to escalate from RED to YELLOW'), ('ticket.RED.escalate.YELLOW.authorization.authority-2.request', 'Request authorization authority-2 to escalate from RED to YELLOW'), ('ticket.RED.escalate.YELLOW.authorization.authority-2.resolve', 'Resolve authorization authority-2 to escalate from RED to YELLOW'), ('ticket.RED.escalate.YELLOW.authorization.authority-3.read', 'Read authorization authority-3 to escalate from RED to YELLOW'), ('ticket.RED.escalate.YELLOW.authorization.authority-3.request', 'Request authorization authority-3 to escalate from RED to YELLOW'), ('ticket.RED.escalate.YELLOW.authorization.authority-3.resolve', 'Resolve authorization authority-3 to escalate from RED to YELLOW'), ('ticket.RED.event_data.read', 'Read related events from tickets "RED"'), ('ticket.RED.log.read', 'Read logs from tickets "RED"'), ('ticket.RED.log.write', 'Write logs from tickets "RED"'), ('ticket.RED.public_alert_messages.read', 'Read RED alert messages displayed in public site'), ('ticket.RED.public_alert_messages.write', 'Write new RED alert messages displayed in public site'), ('ticket.RED.read', 'Read basic data from tickets "RED"'), ('ticket.YELLOW.alert_complementary_comment.read', 'Read complementary alert data for state YELLOW'), ('ticket.YELLOW.alert_complementary_comment.write', 'Add complementary alert data for state YELLOW'), ('ticket.YELLOW.alert_management_comment.read', 'Read alert management information for state YELLOW'), ('ticket.YELLOW.alert_management_comment.write', 'Add alert management information for state YELLOW'), ('ticket.YELLOW.archive', 'archive YELLOW'), ('ticket.YELLOW.archive.authorization.authority-2.read', 'Read authorization authority-2 to archive YELLOW'), ('ticket.YELLOW.archive.authorization.authority-2.request', 'Request authorization authority-2 to archive YELLOW'), ('ticket.YELLOW.archive.authorization.authority-2.resolve', 'Resolve authorization authority-2 to archive YELLOW'), ('ticket.YELLOW.archive.authorization.authority-3.read', 'Read authorization authority-3 to archive YELLOW'), ('ticket.YELLOW.archive.authorization.authority-3.request', 'Request authorization authority-3 to archive YELLOW'), ('ticket.YELLOW.archive.authorization.authority-3.resolve', 'Resolve authorization authority-3 to archive YELLOW'), ('ticket.YELLOW.children.read', 'Read children tickets from tickets "YELLOW"'), ('ticket.YELLOW.close', 'close YELLOW'), ('ticket.YELLOW.close.authorization.authority-2.read', 'Read authorization authority-2 to close YELLOW'), ('ticket.YELLOW.close.authorization.authority-2.request', 'Request authorization authority-2 to close YELLOW'), ('ticket.YELLOW.close.authorization.authority-2.resolve', 'Resolve authorization authority-2 to close YELLOW'), ('ticket.YELLOW.close.authorization.authority-3.read', 'Read authorization authority-3 to close YELLOW'), ('ticket.YELLOW.close.authorization.authority-3.request', 'Request authorization authority-3 to close YELLOW'), ('ticket.YELLOW.close.authorization.authority-3.resolve', 'Resolve authorization authority-3 to close YELLOW'), ('ticket.YELLOW.close_report_comment.read', 'Read close report for state YELLOW'), ('ticket.YELLOW.close_report_comment.write', 'Add close report for state YELLOW'), ('ticket.YELLOW.escalate.RED', 'Escalate from YELLOW to RED'), ('ticket.YELLOW.escalate.RED.authorization.authority-2.read', 'Read authorization authority-2 to escalate from YELLOW to RED'), ('ticket.YELLOW.escalate.RED.authorization.authority-2.request', 'Request authorization authority-2 to escalate from YELLOW to RED'), ('ticket.YELLOW.escalate.RED.authorization.authority-2.resolve', 'Resolve authorization authority-2 to escalate from YELLOW to RED'), ('ticket.YELLOW.escalate.RED.authorization.authority-3.read', 'Read authorization authority-3 to escalate from YELLOW to RED'), ('ticket.YELLOW.escalate.RED.authorization.authority-3.request', 'Request authorization authority-3 to escalate from YELLOW to RED'), ('ticket.YELLOW.escalate.RED.authorization.authority-3.resolve', 'Resolve authorization authority-3 to escalate from YELLOW to RED'), ('ticket.YELLOW.event_data.read', 'Read related events from tickets "YELLOW"'), ('ticket.YELLOW.log.read', 'Read logs from tickets "YELLOW"'), ('ticket.YELLOW.log.write', 'Write logs from tickets "YELLOW"'), ('ticket.YELLOW.public_alert_messages.read', 'Read YELLOW alert messages displayed in public site'), ('ticket.YELLOW.public_alert_messages.write', 'Write new YELLOW alert messages displayed in public site'), ('ticket.YELLOW.read', 'Read basic data from tickets "YELLOW"'), ('ticket.system.closed.alert_complementary_comment.read', 'Read complementary alert data for state system.closed'), ('ticket.system.closed.alert_management_comment.read', 'Read alert management information for state system.closed'), ('ticket.system.closed.children.read', 'Read children tickets from tickets "system.closed"'), ('ticket.system.closed.close_report_comment.read', 'Read close report for state system.closed'), ('ticket.system.closed.event_data.read', 'Read related events from tickets "system.closed"'), ('ticket.system.closed.event_management_comment.read', 'Read event management data for state system.closed'), ('ticket.system.closed.log.read', 'Read logs from tickets "system.closed"'), ('ticket.system.closed.log.write', 'Write logs from tickets "system.closed"'), ('ticket.system.closed.public_alert_messages.read', 'Read system.closed alert messages displayed in public site'), ('ticket.system.closed.read', 'Read basic data from tickets "system.closed"')]},
        ),
    ]
