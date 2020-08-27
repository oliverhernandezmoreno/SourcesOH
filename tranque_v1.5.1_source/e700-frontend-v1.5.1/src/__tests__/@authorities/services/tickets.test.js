import { getTicketsCount, getAlertColor } from "@authorities/services/tickets";
import { NO_ALERT_COLOR, YELLOW_ALERT_COLOR, RED_ALERT_COLOR } from '@authorities/constants/alerts';

const EF_CANONICAL_NAME = 'ef';
const EMAC_CANONICAL_NAME = 'emac';

describe('getTicketsCount ', () => {
    it('should return tickets count by given parameters: level and profile', () => {
        // Arrange:
        const ticketlist1 = [
            {
                base_module: 'ef.m1.level1.terremoto-3-4',
                result_state: {
                    level: 1
                },
                archived: false,
                evaluable: true,
                state: 'system.open'
            },
            {
                base_module: 'ef.m1.level3.terremoto-5-6',
                result_state: {
                    level: 3
                },
                archived: false,
                evaluable: true,
                state: 'system.open'
            },
        ];

        const ticketlist2 = [
            {
                base_module: 'emac.m1.level2.lluvia',
                result_state: {
                    level: 2
                },
                archived: false,
                evaluable: true,
                state: 'system.open'
            },
            {
                base_module: 'emac.m1.level4.lluvia',
                result_state: {
                    level: 4
                },
                archived: false,
                evaluable: true,
                state: 'system.open'
            },
        ];

        const ticketlist3 = [
            {
                base_module: 'ef.m1.level5.terremoto-7-8',
                result_state: {
                    level: 5
                },
                archived: false,
                evaluable: true,
                state: 'system.open'
            },
            {
                base_module: 'emac.m1.level5.lluvia',
                result_state: {
                    level: 5
                },
                archived: false,
                evaluable: true,
                state: 'system.open'
            },
        ];

        const ticketlist4 = [
            {
                base_module: 'ef.m1.level6.terremoto-8-9',
                result_state: {
                    level: 6
                },
                archived: false,
                evaluable: true,
                state: 'system.open'
            },
            {
                base_module: 'ef.m1.level6.terremoto-8-9',
                result_state: {
                    level: 6
                },
                archived: false,
                evaluable: true,
                state: 'system.open'
            },
        ];

        // Act
        const ticketsCount_ticketlist_1_level_1_ef = getTicketsCount(ticketlist1, 1, EF_CANONICAL_NAME);
        const ticketsCount_ticketlist_1_level_2_ef = getTicketsCount(ticketlist1, 2, EF_CANONICAL_NAME);
        const ticketsCount_ticketlist_1_level_3_ef = getTicketsCount(ticketlist1, 3, EF_CANONICAL_NAME);
        const ticketsCount_ticketlist_1_level_4_ef = getTicketsCount(ticketlist1, 4, EF_CANONICAL_NAME);
        const ticketsCount_ticketlist_1_level_5_ef = getTicketsCount(ticketlist1, 5, EF_CANONICAL_NAME);
        const ticketsCount_ticketlist_1_level_6_ef = getTicketsCount(ticketlist1, 6, EF_CANONICAL_NAME);

        const ticketsCount_ticketlist_1_level_1_emac = getTicketsCount(ticketlist1, 1, EMAC_CANONICAL_NAME);
        const ticketsCount_ticketlist_1_level_2_emac = getTicketsCount(ticketlist1, 2, EMAC_CANONICAL_NAME);
        const ticketsCount_ticketlist_1_level_3_emac = getTicketsCount(ticketlist1, 3, EMAC_CANONICAL_NAME);
        const ticketsCount_ticketlist_1_level_4_emac = getTicketsCount(ticketlist1, 4, EMAC_CANONICAL_NAME);
        const ticketsCount_ticketlist_1_level_5_emac = getTicketsCount(ticketlist1, 5, EMAC_CANONICAL_NAME);
        const ticketsCount_ticketlist_1_level_6_emac = getTicketsCount(ticketlist1, 6, EMAC_CANONICAL_NAME);

        const ticketsCount_ticketlist_2_level_1_ef = getTicketsCount(ticketlist2, 1, EF_CANONICAL_NAME);
        const ticketsCount_ticketlist_2_level_2_ef = getTicketsCount(ticketlist2, 2, EF_CANONICAL_NAME);
        const ticketsCount_ticketlist_2_level_3_ef = getTicketsCount(ticketlist2, 3, EF_CANONICAL_NAME);
        const ticketsCount_ticketlist_2_level_4_ef = getTicketsCount(ticketlist2, 4, EF_CANONICAL_NAME);
        const ticketsCount_ticketlist_2_level_5_ef = getTicketsCount(ticketlist2, 5, EF_CANONICAL_NAME);
        const ticketsCount_ticketlist_2_level_6_ef = getTicketsCount(ticketlist2, 6, EF_CANONICAL_NAME);

        const ticketsCount_ticketlist_2_level_1_emac = getTicketsCount(ticketlist2, 1, EMAC_CANONICAL_NAME);
        const ticketsCount_ticketlist_2_level_2_emac = getTicketsCount(ticketlist2, 2, EMAC_CANONICAL_NAME);
        const ticketsCount_ticketlist_2_level_3_emac = getTicketsCount(ticketlist2, 3, EMAC_CANONICAL_NAME);
        const ticketsCount_ticketlist_2_level_4_emac = getTicketsCount(ticketlist2, 4, EMAC_CANONICAL_NAME);
        const ticketsCount_ticketlist_2_level_5_emac = getTicketsCount(ticketlist2, 5, EMAC_CANONICAL_NAME);
        const ticketsCount_ticketlist_2_level_6_emac = getTicketsCount(ticketlist2, 6, EMAC_CANONICAL_NAME);

        const ticketsCount_ticketlist_3_level_1_ef = getTicketsCount(ticketlist3, 1, EF_CANONICAL_NAME);
        const ticketsCount_ticketlist_3_level_2_ef = getTicketsCount(ticketlist3, 2, EF_CANONICAL_NAME);
        const ticketsCount_ticketlist_3_level_3_ef = getTicketsCount(ticketlist3, 3, EF_CANONICAL_NAME);
        const ticketsCount_ticketlist_3_level_4_ef = getTicketsCount(ticketlist3, 4, EF_CANONICAL_NAME);
        const ticketsCount_ticketlist_3_level_5_ef = getTicketsCount(ticketlist3, 5, EF_CANONICAL_NAME);
        const ticketsCount_ticketlist_3_level_6_ef = getTicketsCount(ticketlist3, 6, EF_CANONICAL_NAME);

        const ticketsCount_ticketlist_3_level_1_emac = getTicketsCount(ticketlist3, 1, EMAC_CANONICAL_NAME);
        const ticketsCount_ticketlist_3_level_2_emac = getTicketsCount(ticketlist3, 2, EMAC_CANONICAL_NAME);
        const ticketsCount_ticketlist_3_level_3_emac = getTicketsCount(ticketlist3, 3, EMAC_CANONICAL_NAME);
        const ticketsCount_ticketlist_3_level_4_emac = getTicketsCount(ticketlist3, 4, EMAC_CANONICAL_NAME);
        const ticketsCount_ticketlist_3_level_5_emac = getTicketsCount(ticketlist3, 5, EMAC_CANONICAL_NAME);
        const ticketsCount_ticketlist_3_level_6_emac = getTicketsCount(ticketlist3, 6, EMAC_CANONICAL_NAME);

        const ticketsCount_ticketlist_4_level_1_ef = getTicketsCount(ticketlist4, 1, EF_CANONICAL_NAME);
        const ticketsCount_ticketlist_4_level_2_ef = getTicketsCount(ticketlist4, 2, EF_CANONICAL_NAME);
        const ticketsCount_ticketlist_4_level_3_ef = getTicketsCount(ticketlist4, 3, EF_CANONICAL_NAME);
        const ticketsCount_ticketlist_4_level_4_ef = getTicketsCount(ticketlist4, 4, EF_CANONICAL_NAME);
        const ticketsCount_ticketlist_4_level_5_ef = getTicketsCount(ticketlist4, 5, EF_CANONICAL_NAME);
        const ticketsCount_ticketlist_4_level_6_ef = getTicketsCount(ticketlist4, 6, EF_CANONICAL_NAME);

        const ticketsCount_ticketlist_4_level_1_emac = getTicketsCount(ticketlist4, 1, EMAC_CANONICAL_NAME);
        const ticketsCount_ticketlist_4_level_2_emac = getTicketsCount(ticketlist4, 2, EMAC_CANONICAL_NAME);
        const ticketsCount_ticketlist_4_level_3_emac = getTicketsCount(ticketlist4, 3, EMAC_CANONICAL_NAME);
        const ticketsCount_ticketlist_4_level_4_emac = getTicketsCount(ticketlist4, 4, EMAC_CANONICAL_NAME);
        const ticketsCount_ticketlist_4_level_5_emac = getTicketsCount(ticketlist4, 5, EMAC_CANONICAL_NAME);
        const ticketsCount_ticketlist_4_level_6_emac = getTicketsCount(ticketlist4, 6, EMAC_CANONICAL_NAME);


        // Assert:
        expect(ticketsCount_ticketlist_1_level_1_ef).toBe(1);
        expect(ticketsCount_ticketlist_1_level_2_ef).toBe(0);
        expect(ticketsCount_ticketlist_1_level_3_ef).toBe(1);
        expect(ticketsCount_ticketlist_1_level_4_ef).toBe(0);
        expect(ticketsCount_ticketlist_1_level_5_ef).toBe(0);
        expect(ticketsCount_ticketlist_1_level_6_ef).toBe(0);

        expect(ticketsCount_ticketlist_1_level_1_emac).toBe(0);
        expect(ticketsCount_ticketlist_1_level_2_emac).toBe(0);
        expect(ticketsCount_ticketlist_1_level_3_emac).toBe(0);
        expect(ticketsCount_ticketlist_1_level_4_emac).toBe(0);
        expect(ticketsCount_ticketlist_1_level_5_emac).toBe(0);
        expect(ticketsCount_ticketlist_1_level_6_emac).toBe(0);

        expect(ticketsCount_ticketlist_2_level_1_ef).toBe(0);
        expect(ticketsCount_ticketlist_2_level_2_ef).toBe(0);
        expect(ticketsCount_ticketlist_2_level_3_ef).toBe(0);
        expect(ticketsCount_ticketlist_2_level_4_ef).toBe(0);
        expect(ticketsCount_ticketlist_2_level_5_ef).toBe(0);
        expect(ticketsCount_ticketlist_2_level_6_ef).toBe(0);

        expect(ticketsCount_ticketlist_2_level_1_emac).toBe(0);
        expect(ticketsCount_ticketlist_2_level_2_emac).toBe(1);
        expect(ticketsCount_ticketlist_2_level_3_emac).toBe(0);
        expect(ticketsCount_ticketlist_2_level_4_emac).toBe(1);
        expect(ticketsCount_ticketlist_2_level_5_emac).toBe(0);
        expect(ticketsCount_ticketlist_2_level_6_emac).toBe(0);

        expect(ticketsCount_ticketlist_3_level_1_ef).toBe(0);
        expect(ticketsCount_ticketlist_3_level_2_ef).toBe(0);
        expect(ticketsCount_ticketlist_3_level_3_ef).toBe(0);
        expect(ticketsCount_ticketlist_3_level_4_ef).toBe(0);
        expect(ticketsCount_ticketlist_3_level_5_ef).toBe(1);
        expect(ticketsCount_ticketlist_3_level_6_ef).toBe(0);

        expect(ticketsCount_ticketlist_3_level_1_emac).toBe(0);
        expect(ticketsCount_ticketlist_3_level_2_emac).toBe(0);
        expect(ticketsCount_ticketlist_3_level_3_emac).toBe(0);
        expect(ticketsCount_ticketlist_3_level_4_emac).toBe(0);
        expect(ticketsCount_ticketlist_3_level_5_emac).toBe(1);
        expect(ticketsCount_ticketlist_3_level_6_emac).toBe(0);

        expect(ticketsCount_ticketlist_4_level_1_ef).toBe(0);
        expect(ticketsCount_ticketlist_4_level_2_ef).toBe(0);
        expect(ticketsCount_ticketlist_4_level_3_ef).toBe(0);
        expect(ticketsCount_ticketlist_4_level_4_ef).toBe(0);
        expect(ticketsCount_ticketlist_4_level_5_ef).toBe(0);
        expect(ticketsCount_ticketlist_4_level_6_ef).toBe(2);

        expect(ticketsCount_ticketlist_4_level_1_emac).toBe(0);
        expect(ticketsCount_ticketlist_4_level_2_emac).toBe(0);
        expect(ticketsCount_ticketlist_4_level_3_emac).toBe(0);
        expect(ticketsCount_ticketlist_4_level_4_emac).toBe(0);
        expect(ticketsCount_ticketlist_4_level_5_emac).toBe(0);
        expect(ticketsCount_ticketlist_4_level_6_emac).toBe(0);
    });
});

describe('getAlertColor ', () => {
    it('should return the worst alert color', () => {
        // Arrange:
        const ticketlist1 = [
            {
                base_module: 'ef.m1.level2.terremoto-4-6',
                result_state: {
                    level: 2
                },
                archived: false,
                evaluable: true,
                state: 'system.open'
            },
            {
                base_module: 'ef.m1.level6.terremoto-8-9',
                result_state: {
                    level: 6
                },
                archived: false,
                evaluable: true,
                state: 'system.open'
            }
        ];

        const ticketlist2 = [
            {
                base_module: 'ef.m1.level4.terremoto-5-6',
                result_state: {
                    level: 4
                },
                archived: false,
                evaluable: true,
                state: 'system.open'
            },
            {
                base_module: 'emac.m1.level5.lluvia',
                result_state: {
                    level: 5
                },
                archived: false,
                evaluable: true,
                state: 'system.open'
            },
        ];

        const ticketlist3 = [
            {
                base_module: 'emac.m1.level5.lluvia',
                result_state: {
                    level: 5
                },
                archived: false,
                evaluable: true,
                state: 'system.open'
            },
            {
                base_module: 'ef.m1.level6.terremoto-8-9',
                result_state: {
                    level: 6
                },
                archived: false,
                evaluable: true,
                state: 'system.open'
            }
        ];

        const ticketlist4 = [];

        // Act
        const alertColorEF_ticketlist_1 = getAlertColor(ticketlist1, EF_CANONICAL_NAME);
        const alertColorEMAC_ticketlist_1 = getAlertColor(ticketlist1, EMAC_CANONICAL_NAME);

        const alertColorEF_ticketlist_2 = getAlertColor(ticketlist2, EF_CANONICAL_NAME);
        const alertColorEMAC_ticketlist_2 = getAlertColor(ticketlist2, EMAC_CANONICAL_NAME);

        const alertColorEF_ticketlist_3 = getAlertColor(ticketlist3, EF_CANONICAL_NAME);
        const alertColorEMAC_ticketlist_3 = getAlertColor(ticketlist3, EMAC_CANONICAL_NAME);

        const alertColorEF_ticketlist_4 = getAlertColor(ticketlist4, EF_CANONICAL_NAME);
        const alertColorEMAC_ticketlist_4 = getAlertColor(ticketlist4, EMAC_CANONICAL_NAME);

        // Assert:
        expect(alertColorEF_ticketlist_1).toBe(RED_ALERT_COLOR);
        expect(alertColorEMAC_ticketlist_1).toBe(NO_ALERT_COLOR);

        expect(alertColorEF_ticketlist_2).toBe(NO_ALERT_COLOR);
        expect(alertColorEMAC_ticketlist_2).toBe(YELLOW_ALERT_COLOR);

        expect(alertColorEF_ticketlist_3).toBe(RED_ALERT_COLOR);
        expect(alertColorEMAC_ticketlist_3).toBe(YELLOW_ALERT_COLOR);

        expect(alertColorEF_ticketlist_4).toBe(NO_ALERT_COLOR);
        expect(alertColorEMAC_ticketlist_4).toBe(NO_ALERT_COLOR);
    });
});
