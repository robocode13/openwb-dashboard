import { describe, expect, it, vi } from 'vitest';
import type { Config } from '../config';
import { calculateBalance } from './balanceService';

vi.mock('./readingsRepository', async () => {
	return {
		getStartOfDayReading: vi.fn().mockImplementation(async (date) => {
			if (date.getTime() === new Date('2024-08-01T00:00').getTime()) {
				return {
					dateTime: new Date('2024-08-01T00:00:00'),
					gridIn: 10,
					gridOut: 20,
					pv: 30,
					wallbox: 40,
					batteryIn: 50,
					batteryOut: 60
				};
			} else if (date.getTime() === new Date('2024-08-11T00:00').getTime()) {
				return {
					dateTime: new Date('2024-08-11T00:00:00'),
					gridIn: 11,
					gridOut: 240,
					pv: 350,
					wallbox: 60,
					batteryIn: 80,
					batteryOut: 85
				};
			} else if (date.getTime() === new Date('2024-09-01T00:00').getTime()) {
				return {
					dateTime: new Date('2024-09-01T00:00:00'),
					gridIn: 13,
					gridOut: 670,
					pv: 1030,
					wallbox: 110,
					batteryIn: 150,
					batteryOut: 150
				};
			}
		})
	};
});

describe('calculateBalance', () => {
	it('when prices do not change in period', async () => {
		const config: Config = {
			wallboxHost: 'openwb',
			wallboxVersion: 1,
			installationDate: new Date('2024-08-01T00:00'),
			sellPrice: 0.08,
			buyPrices: [{ date: new Date('2024-08-01T00:00'), unitPrice: 0.25, basePricePerYear: 150 }],
			repair: {
				blacklist: [],
				adjustments: []
			}
		};

		const balance = await calculateBalance(new Date('2024-08-01T00:00'), new Date('2024-09-01T00:00'), config);

		expect(balance.sellingIncome).toBe(650 * 0.08);
		expect(balance.savings).toBe((90 + 1000 - 650 - 100) * 0.25);
		expect(balance.buyingUnitCosts).toBe(3 * 0.25);
	});

	it('when prices change once in period', async () => {
		const config: Config = {
			wallboxHost: 'openwb',
			wallboxVersion: 1,
			installationDate: new Date('2024-08-01T00:00'),
			sellPrice: 0.08,
			buyPrices: [
				{ date: new Date('2024-07-01T00:00'), unitPrice: 0.25, basePricePerYear: 150 },
				{ date: new Date('2024-08-11T00:00'), unitPrice: 0.3, basePricePerYear: 150 }
			],
			repair: {
				blacklist: [],
				adjustments: []
			}
		};

		const balance = await calculateBalance(new Date('2024-08-01T00:00'), new Date('2024-09-01T00:00'), config);

		expect(balance.sellingIncome).toBe(650 * 0.08);
		expect(balance.savings).toBe((25 + 320 - 220 - 30) * 0.25 + (65 + 680 - 430 - 70) * 0.3);
		expect(balance.buyingUnitCosts).toBe(1 * 0.25 + 2 * 0.3);
	});
});
