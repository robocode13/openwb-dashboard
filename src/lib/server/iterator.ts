import type { Config } from '../config';
import type { Reading } from '../readings';
import { readDailyFile } from './readingsRepository';

export async function* readingsIterator(fromDate: Date, config: Config): AsyncGenerator<Reading> {
	const maxDate = new Date();
	maxDate.setHours(0, 0, 0, 0);
	maxDate.setDate(maxDate.getDate() + 1);

	if (fromDate > maxDate) {
		throw new Error('fromDate is in the future');
	}

	let currentDate = new Date(fromDate);

	while (currentDate < maxDate) {
		let readings = await readDailyFile(currentDate, config);
		let index = readings.findIndex((reading) => reading.dateTime >= fromDate);

		while (index >= 0 && index < readings.length) {
			yield readings[index++];
		}

		currentDate.setDate(currentDate.getDate() + 1);
	}
}

export async function* backwardsReadingsIterator(
	fromDate: Date,
	minDate: Date,
	config: Config
): AsyncGenerator<Reading> {
	if (fromDate < minDate) {
		throw new Error('fromDate is before minDate');
	}

	let currentDate = new Date(fromDate);

	while (currentDate >= minDate) {
		let readings = await readDailyFile(currentDate, config);
		let index = readings.findLastIndex((reading) => reading.dateTime <= fromDate);

		while (index >= 0) {
			yield readings[index--];
		}

		currentDate.setDate(currentDate.getDate() - 1);
	}
}
