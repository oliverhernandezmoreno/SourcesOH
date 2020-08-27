from django.contrib import admin
from alerts.models import (
    Ticket, TicketLog, Broadcast, UserIntent, PublicAlertMessage, AuthorizationRequest, AlertDisconnection
)


@admin.register(Ticket)
class TicketAdmin(admin.ModelAdmin):
    list_display = ("controller_name", "module", "id", "created_at", "updated_at")

    def controller_name(self, ticket):
        return ticket.base_controller.name if ticket.base_controller is not None else "-"


@admin.register(TicketLog)
class TicketLogAdmin(admin.ModelAdmin):
    list_display = ("ticket", "created_at")


@admin.register(Broadcast)
class BroadcastAdmin(admin.ModelAdmin):
    list_display = ("ticket", "created_at", "broadcasted_at")


@admin.register(UserIntent)
class UserIntentAdmin(admin.ModelAdmin):
    list_display = ("module", "user", "created_at", "attended_at", "issue")


@admin.register(PublicAlertMessage)
class PublicAlertMessageAdmin(admin.ModelAdmin):
    list_display = ("id", "target", "alert_type", "content")


@admin.register(AuthorizationRequest)
class AuthorizationRequestAdmin(admin.ModelAdmin):
    list_display = ("id", "authorization", "author", "status")

    def author(self, obj):
        if 'username' in obj.created_by:
            return obj.created_by['username']
        else:
            return None


@admin.register(AlertDisconnection)
class AlertDisconnectionAdmin(admin.ModelAdmin):
    list_display = ("id", "target", "created_at")
