import type { DayReadings, Reading } from '$lib/readings';
import { type Config } from '../config';
import { isoDateFormat } from '../format';
import { correctReading } from '../repair';

const dayReadingsCache = new Map<string, DayReadings>();
let firstReading: Reading;
let lastReading: Reading;

export async function getStartOfDayReading(date: Date, config: Config): Promise<Reading | undefined> {
	if (!config.installationDate) {
		throw new Error('Installation date is not set');
	}

	date = new Date(date);
	date.setHours(0, 0, 0, 0);
	const today = new Date();
	today.setHours(0, 0, 0, 0);

	let reading: Reading | undefined;

	if (date < config.installationDate) {
		reading = await getFirstReading(config.installationDate, config);
	} else if (date > today || (lastReading && date > lastReading.dateTime)) {
		reading = await getLastReading(config.installationDate, config);
	} else {
		const dayReadings = await readCachedDayReadings(date, config);

		if (dayReadings) {
			reading = dayReadings.startOfDay;
		} else {
			const previousDay = new Date(date);
			previousDay.setDate(date.getDate() - 1);
			const previousReadings = await readCachedDayReadings(previousDay, config);
			reading = previousReadings?.endOfDay;
		}
	}

	return correctReading(reading, config.repair);
}

export async function getFirstReading(minDate: Date, config: Config): Promise<Reading> {
	if (!firstReading) {
		const today = new Date();
		today.setHours(0, 0, 0, 0);
		const date = new Date(minDate);
		date.setHours(0, 0, 0, 0);
		let dayReadings = await readCachedDayReadings(date, config);

		while (!dayReadings && date <= today) {
			date.setDate(today.getDate() + 1);
			dayReadings = await readCachedDayReadings(date, config);
		}

		if (dayReadings) {
			firstReading = dayReadings.startOfDay;
		}
	}

	return firstReading;
}

export async function getLastReading(minDate: Date, config: Config): Promise<Reading> {
	const now = new Date();

	if (!lastReading || now.getTime() - lastReading.dateTime.getTime() >= 1000 * 60 * 5) {
		const date = new Date();
		date.setHours(0, 0, 0, 0);
		let dayReadings = await readCachedDayReadings(date, config);

		while (!dayReadings && date >= minDate) {
			date.setDate(date.getDate() - 1);
			dayReadings = await readCachedDayReadings(date, config);
		}

		if (dayReadings) {
			lastReading = dayReadings.endOfDay;
		}
	}

	return lastReading;
}

async function readCachedDayReadings(date: Date, config: Config): Promise<DayReadings | undefined> {
	let dayReadings = dayReadingsCache.get(isoDateFormat.format(date));

	const now = new Date();
	const today = new Date();
	today.setHours(0, 0, 0, 0);

	if (dayReadings) {
		if (date < today || now.getTime() - dayReadings.endOfDay.dateTime.getTime() < 1000 * 60 * 5) {
			return dayReadings;
		}
	}

	const readings = await readDailyFile(date, config);

	if (readings.length > 0) {
		dayReadings = {
			startOfDay: readings[0],
			endOfDay: readings[readings.length - 1]
		};

		dayReadingsCache.set(isoDateFormat.format(date), dayReadings);

		return dayReadings;
	}
}

export async function readDailyFile(date: Date, config: Config): Promise<Reading[]> {
	const url = getDailyLogUrl(date, config);
	const response = await fetch(url);
	if (response.ok) {
		console.log(url, 'OK');
		const text = await response.text();

		try {
			if (config.wallboxVersion >= 2) {
				return parseJson(date, text);
			} else {
				return parseCsv(date, text);
			}
		} catch (error) {
			console.warn('Could not parse', url, error);
			return [];
		}
	}

	console.log(url, 'NOT FOUND');
	return [];
}

function getDailyLogUrl(date: Date, config: Config) {
	if (config.wallboxVersion >= 2) {
		const fileName = `${isoDateFormat.format(date).replaceAll('-', '')}.json`;
		return `http://${config.wallboxHost}/openWB/data/daily_log/${fileName}`;
	} else {
		const fileName = `${isoDateFormat.format(date).replaceAll('-', '')}.csv`;
		return `http://${config.wallboxHost}/openWB/web/logging/data/daily/${fileName}`;
	}
}

function parseCsv(date: Date, text: string): Reading[] {
	const lines = text.split('\n');
	const readings = lines
		.filter((line) => line.length > 20)
		.map((line: string) => {
			const cells = line.split(',');
			let dateTime = new Date(date);
			const hour = parseInt(cells[0].slice(0, 2));
			const minute = parseInt(cells[0].slice(2, 4));
			dateTime.setHours(hour, minute, 0, 0);

			const reading: Reading = {
				dateTime: dateTime,
				gridIn: parseFloat(cells[1]) / 1000,
				gridOut: parseFloat(cells[2]) / 1000,
				pv: parseFloat(cells[3]) / 1000,
				wallbox: parseFloat(cells[4]) / 1000,
				batteryIn: parseFloat(cells[8]) / 1000,
				batteryOut: parseFloat(cells[9]) / 1000,
				batterySoc: parseFloat(cells[20])
			};

			return reading;
		});

	return readings;
}

function parseJson(date: Date, text: string): Reading[] {
	const data = JSON.parse(text);
	const readings = data.entries.map((item: any) => {
		let dateTime = new Date(item.timestamp * 1000);

		const reading: Reading = {
			dateTime: dateTime,
			gridIn: 0,
			gridOut: 0,
			pv: 0,
			wallbox: 0,
			batteryIn: 0,
			batteryOut: 0,
			batterySoc: 0
		};

		const counters = item.counter;
		for (let key in counters) {
			const counter = counters[key];
			reading.gridIn = counter.imported / 1000;
			reading.gridOut = counter.exported / 1000;
			break;
		}

		const pvs = item.pv;
		for (let key in pvs) {
			const pv = pvs[key];
			reading.pv = pv.exported / 1000;
			break;
		}

		const cps = item.cp;
		for (let key in cps) {
			const cp = cps[key];
			reading.wallbox = cp.imported / 1000;
			break;
		}

		const bats = item.bat;
		for (let key in bats) {
			const bat = bats[key];
			reading.batteryIn = bat.imported / 1000;
			reading.batteryOut = bat.exported / 1000;
			reading.batterySoc = bat.soc;
			break;
		}

		return reading;
	});

	return readings;
}
