// The string correspond to ones in backend
export const TICKET_MANAGER = 'event_management';
export const ALERT_BACKGROUND = 'alert_complementary';
export const ALERT_TRACING = 'alert_management';
export const CLOSING_ACT = 'close_report';
export const AUTHORIZE = 'authorize';

export function getSpanishName(comment_type) {
    switch (comment_type) {
        case TICKET_MANAGER:
            return 'Reporte de gestión';
        case ALERT_TRACING:
            return 'Reporte de seguimiento de alerta (exclusivo autoridades)';
        case ALERT_BACKGROUND:
            return 'Antecedentes para comunicar alerta en sitio público (compartido por la minera)';
        case CLOSING_ACT:
            return 'Acta de cierre de alerta roja (exclusivo autoridades)';
        case AUTHORIZE:
            return 'Resolución de autorización';
        default: return '';
    }
}