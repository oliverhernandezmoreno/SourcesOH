import {NONE, NOT_CONFIGURED, WITHOUT_ALERT, YELLOW_ALERT} from '@authorities/constants/indexState';
import {getIndexStatus, getTargetIndexesStatus, getWorstIndexStatus} from '@authorities/services/indexes';

describe('getIndexStatus ', () => {
    it('should return correct status', () => {
        // Arrange:
        const thresholds = [
            {
                upper: null,
                lower: '0.3',
                kind: null
            },
            {
                upper: '0.8',
                lower: null,
                kind: null
            }
        ];
        // Assert:
        expect(getIndexStatus(0.1, thresholds)).toEqual(YELLOW_ALERT);
        expect(getIndexStatus(0.5, thresholds)).toEqual(WITHOUT_ALERT);
        expect(getIndexStatus(1, thresholds)).toEqual(YELLOW_ALERT);
    });
});

describe('getTargetIndexesStatus && getWorstIndexStatus', () => {
    it('should get the worst index status value among a set of indexes',
        () => {
            const thresholds = [
                {
                    upper: '0.8',
                    lower: null,
                    kind: null
                }
            ];

            const timeseries = [
                {
                    target_canonical_name: 'target1',
                    events: [
                        {
                            name: 'target1.timeseries1',
                            value: 0
                        }
                    ],
                    template_name: 'template1',
                    thresholds
                },
                {
                    target_canonical_name: 'target1',
                    events: [
                        {
                            name: 'target1.timeseries2',
                            value: 0
                        }
                    ],
                    template_name: 'template2',
                    thresholds
                },
                {
                    target_canonical_name: 'target2',
                    events: [
                        {
                            name: 'target2.timeseries1',
                            value: 1
                        }
                    ],
                    template_name: 'template1',
                    thresholds
                },
                {
                    target_canonical_name: 'target2',
                    events: [
                        {
                            name: 'target2.timeseries2',
                            value: 0
                        }
                    ],
                    template_name: 'template2',
                    thresholds
                },
                {
                    target_canonical_name: 'target3',
                    events: [],
                    template_name: 'template1',
                    thresholds
                }
            ];

            const res1 = getTargetIndexesStatus('target1', timeseries);            
            expect(res1.every(r => r.timeseries.target_canonical_name === 'target1')).toBeTruthy();
            expect(res1.length).toBe(2);
            expect(res1[0].status).toBe(WITHOUT_ALERT);
            expect(res1[1].status).toBe(WITHOUT_ALERT);
            expect(getWorstIndexStatus(res1)).toBe(WITHOUT_ALERT);

            const res2 = getTargetIndexesStatus('target2', timeseries);
            expect(res2.every(r => r.timeseries.target_canonical_name === 'target2')).toBeTruthy();
            expect(res2.length).toBe(2);
            expect(res2[0].status).toBe(YELLOW_ALERT);
            expect(res2[1].status).toBe(WITHOUT_ALERT);
            expect(getWorstIndexStatus(res2)).toBe(YELLOW_ALERT);

            const res3 = getTargetIndexesStatus('target3', timeseries);
            expect(res3.every(r => r.timeseries.target_canonical_name === 'target3')).toBeTruthy();
            expect(res3.length).toBe(1);
            expect(res3[0].status).toBe(NOT_CONFIGURED);
            expect(getWorstIndexStatus(res3)).toBe(NOT_CONFIGURED);

            expect(getWorstIndexStatus([])).toBe(NONE);
        });
});
