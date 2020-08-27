from alerts.models import TicketComment, Ticket, AuthorizationRequest
from alerts.modules.base_states import CONDITIONS_TYPES
from django.db.models import Count

condition_never = {
    'description': 'Always false condition, ',
    'complete': False
}

required_by_all = '__all__'


def has_alert_management_comment(ticket):
    return ticket.comments.filter(comment_type=TicketComment.CommentType.ALERT_MANAGEMENT).exists()


def condition_alert_comment(ticket, required_by=required_by_all):
    return {
        'type': CONDITIONS_TYPES.comment,
        'description': 'Archivo adjunto o comentario',
        'complete': has_alert_management_comment(ticket),
        'issue': 'INSUFFICIENT_INFORMATION',
        'required_by': required_by
    }


def has_close_comment(ticket):
    comment_type = TicketComment.CommentType.CLOSE_REPORT
    comments = ticket.comments.annotate(num_documents=Count('documents'))
    return comments.filter(num_documents__gt=0, comment_type=comment_type).exists()


def condition_close_comment(ticket, required_by=required_by_all):
    return {
        'type': CONDITIONS_TYPES.comment,
        'description': 'Acta del comite operativo de emergencia (COE)',
        'complete': has_close_comment(ticket),
        'issue': 'INSUFFICIENT_INFORMATION',
        'required_by': required_by
    }


def is_closed(ticket):
    return ticket.state == Ticket.TicketState.CLOSED


def all_closed(tickets, ticket_filter):
    return all(is_closed(t) for t in filter(ticket_filter, tickets))


def condition_children_closed(ticket, ctx, ticket_filter=lambda t: True, required_by=required_by_all):
    ticket_children = all_closed(ticket.children.all(), ticket_filter)
    context_children = all_closed(ctx.controller.child_tickets, ticket_filter)
    return {
        'type': CONDITIONS_TYPES.ticket,
        'description': 'Cierre de todos los tickets anidados',
        'complete': ticket_children and context_children,
        'issue': 'BLOCKED_BY_RULES',
        'required_by': required_by
    }


def has_event_management_comment(ticket):
    return ticket.comments.filter(comment_type=TicketComment.CommentType.EVENT_MANAGEMENT).exists()


def condition_event_comment(ticket, required_by=required_by_all):
    return {
        'type': CONDITIONS_TYPES.comment,
        'description': 'Archivo adjunto o comentario',
        'complete': has_event_management_comment(ticket),
        'issue': 'INSUFFICIENT_INFORMATION',
        'required_by': required_by
    }


def get_authorization(auth_from, auth_lvl, from_state, action, to_state):
    if to_state is None:
        return f'ticket.{from_state}.{action}.authorization.{auth_from}-{auth_lvl}'
    else:
        return f'ticket.{from_state}.{action}.{to_state}.authorization.{auth_from}-{auth_lvl}'


def has_authorization(ticket, authorization):
    return ticket.authorizations.filter(
        authorization=authorization,
        status=AuthorizationRequest.Status.APPROVED
    ).exists()


def condition_auth_authority(ticket, auth_lvl, from_state, action, to_state=None, required_by=required_by_all):
    authorization = get_authorization('authority', auth_lvl, from_state, action, to_state)
    return {
        'type': CONDITIONS_TYPES.authorization,
        'description': f'Autorización de autoridad (Autoridad-{auth_lvl})',
        'authorization': authorization,
        'complete': has_authorization(ticket, authorization),
        'issue': 'AUTHORIZATION_REQUIRED',
        'required_by': required_by
    }


def condition_auth_miner(ticket, auth_lvl, from_state, action, to_state=None, required_by=required_by_all):
    authorization = get_authorization('miner', auth_lvl, from_state, action, to_state)
    return {
        'type': CONDITIONS_TYPES.authorization,
        'description': f'Autorización de minera (Minera-{auth_lvl})',
        'authorization': authorization,
        'complete': has_authorization(ticket, authorization),
        'issue': 'AUTHORIZATION_REQUIRED',
        'required_by': required_by
    }


def condition_event_normalization(ticket, ctx, required_by=required_by_all):
    events = getattr(ctx, 'events', [])
    return {
        'type': CONDITIONS_TYPES.event,
        'description': 'Normalización del parámetro afectado (No cumplimiento de evento)',
        'complete': ctx.controller.are_events_normalized(ticket, events),
        'issue': 'BLOCKED_BY_RULES',
        'required_by': required_by
    }


def get_next_authorization(conditions, request_user):
    return next((
        c['authorization']
        for c in conditions
        if 'authorization' in c and not c['complete'] and requires_condition(c, request_user)
        ), None)


def requires_condition(condition, user):
    user_groups = user.groups.all()
    if 'required_by' not in condition or condition['required_by'] == required_by_all:
        return True
    else:
        return any(group.name in condition['required_by'] for group in user_groups)
