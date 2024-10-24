import { describe, it, expect, vi } from 'vitest';
import { readingsIterator } from './iterator';

const config = {
	wallboxHost: 'openwb',
	wallboxVersion: 1,
	installationDate: new Date('2024-08-01T00:00'),
	sellPrice: 0.082,
	buyPrices: [],
	repair: {
		blacklist: [],
		adjustments: []
	}
};

vi.mock('./readingsRepository', async () => {
	return {
		readDailyFile: vi.fn().mockImplementation(async (date) => {
			if (date.getDate() === 1) {
				return [
					{ dateTime: new Date('2024-08-01T00:00:00'), batterySoc: 73 },
					{ dateTime: new Date('2024-08-01T00:05:00'), batterySoc: 73 },
					{ dateTime: new Date('2024-08-01T00:10:00'), batterySoc: 72 },
					{ dateTime: new Date('2024-08-01T23:55:00'), batterySoc: 35 }
				];
			} else if (date.getDate() === 2) {
				return [
					{ dateTime: new Date('2024-08-02T00:00:00'), batterySoc: 34 },
					{ dateTime: new Date('2024-08-02T00:05:00'), batterySoc: 33 },
					{ dateTime: new Date('2024-08-02T00:10:00'), batterySoc: 32 }
				];
			} else {
				return [];
			}
		})
	};
});

describe('iterator', () => {
	it('should return first reading', async () => {
		const reader = readingsIterator(new Date(2024, 7, 1), config);

		const reading = (await reader.next()).value;

		expect(reading.dateTime).toStrictEqual(new Date('2024-08-01T00:00:00'));
		expect(reading.batterySoc).toBe(73);
	});

	it('should return first three readings', async () => {
		const reader = readingsIterator(new Date(2024, 7, 1), config);

		const reading1 = (await reader.next()).value;
		const reading2 = (await reader.next()).value;
		const reading3 = (await reader.next()).value;

		expect(reading3.dateTime).toStrictEqual(new Date('2024-08-01T00:10:00'));
		expect(reading3.batterySoc).toBe(72);
	});

	it('should return readings when next day is reached', async () => {
		const reader = readingsIterator(new Date(2024, 7, 1, 23, 55), config);

		const reading1 = (await reader.next()).value;
		const reading2 = (await reader.next()).value;

		expect(reading1.dateTime).toStrictEqual(new Date('2024-08-01T23:55:00'));
		expect(reading1.batterySoc).toBe(35);
		expect(reading2.dateTime).toStrictEqual(new Date('2024-08-02T00:00:00'));
		expect(reading2.batterySoc).toBe(34);
	});

	it('should return done when no next reading available', async () => {
		const reader = readingsIterator(new Date(), config);

		const item = await reader.next();
		const item2 = await reader.next();
		const item3 = await reader.next();

		expect(item.done).toBeTruthy();
		expect(item.value).toBeUndefined();
		expect(item2.done).toBeTruthy();
		expect(item2.value).toBeUndefined();
		expect(item3.done).toBeTruthy();
		expect(item3.value).toBeUndefined();
	});
});
