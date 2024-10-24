export type Repair = {
	blacklist: string[];
	adjustments: ReadingAdjustment[];
};

import { toLocalISO } from './format';
import type { Reading, ReadingType } from './readings';

export type ReadingAdjustment = Record<ReadingType, number> & {
	readings: Reading[];
	dateTime: Date;
};

export type ReadingInconsistency = Record<ReadingType, boolean> & {
	firstReading: Reading;
	secondReading: Reading;
};

export function checkInconsistent(firstReading: Reading, secondReading: Reading): ReadingInconsistency | undefined {
	const tolerance = 0.001;

	const inconsistency = {
		firstReading: firstReading,
		secondReading: secondReading,
		gridIn: secondReading.gridIn - firstReading.gridIn < -tolerance,
		gridOut: secondReading.gridOut - firstReading.gridOut < -tolerance,
		pv: secondReading.pv - firstReading.pv < -tolerance,
		wallbox: secondReading.wallbox - firstReading.wallbox < -tolerance,
		batteryIn: secondReading.batteryIn - firstReading.batteryIn < -tolerance,
		batteryOut: secondReading.batteryOut - firstReading.batteryOut < -tolerance
	};

	if (
		inconsistency.gridIn ||
		inconsistency.gridOut ||
		inconsistency.pv ||
		inconsistency.wallbox ||
		inconsistency.batteryIn ||
		inconsistency.batteryOut
	) {
		return inconsistency;
	}
}

export function correctReading(reading: Reading | undefined, repair: Repair): Reading | undefined {
	if (!reading) {
		return undefined;
	}

	if (repair.blacklist.some((dateTime) => dateTime === toLocalISO(reading.dateTime))) {
		return undefined;
	}

	const correctedReading = { ...reading };

	repair.adjustments
		.filter((adjustment) => adjustment.dateTime <= reading.dateTime)
		.forEach((adjustment) => {
			correctedReading.gridIn += adjustment.gridIn;
			correctedReading.gridOut += adjustment.gridOut;
			correctedReading.pv += adjustment.pv;
			correctedReading.wallbox += adjustment.wallbox;
			correctedReading.batteryIn += adjustment.batteryIn;
			correctedReading.batteryOut += adjustment.batteryOut;
		});

	return correctedReading;
}

export function mergeRepairs(repair: Repair, newRepair: Repair): Repair {
	const blacklist = repair.blacklist.concat(
		newRepair.blacklist.filter((dateTime) => !repair.blacklist.includes(dateTime))
	);

	const adjustments = repair.adjustments.concat(
		newRepair.adjustments.filter(
			(adjustment) => !repair.adjustments.some((a) => a.dateTime.getTime() === adjustment.dateTime.getTime())
		)
	);

	blacklist.sort();
	adjustments.sort((a, b) => a.dateTime.getTime() - b.dateTime.getTime());

	return { blacklist, adjustments };
}
