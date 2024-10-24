import type { Config } from '$lib/config';
import { toLocalISO } from '$lib/format';
import type { ReadingType } from '$lib/readings';
import {
	checkInconsistent,
	correctReading,
	type ReadingAdjustment,
	type ReadingInconsistency,
	type Repair
} from '$lib/repair';
import { readingsIterator } from './iterator';
import { getFirstReading, getStartOfDayReading } from './readingsRepository';

export async function checkReadings(config: Config): Promise<Repair> {
	const repair: Repair = {
		blacklist: [],
		adjustments: []
	};

	if (!config.installationDate) {
		throw new Error('Installation date is not set');
	}

	const reader = readingsIterator(config.installationDate, config);

	let firstReading = (await reader.next()).value;
	let secondReading = (await reader.next()).value;
	let thirdReading = (await reader.next()).value;
	let fourthReading = (await reader.next()).value;

	while (firstReading && secondReading) {
		const inconsistency = checkInconsistent(firstReading, secondReading);

		if (inconsistency) {
			if (thirdReading) {
				const followingInconsistency = checkInconsistent(firstReading, thirdReading);

				if (!followingInconsistency) {
					repair.blacklist.push(toLocalISO(secondReading.dateTime));
					firstReading = thirdReading;
					secondReading = fourthReading;
					thirdReading = (await reader.next()).value;
					fourthReading = (await reader.next()).value;
					continue;
				} else {
					if (fourthReading) {
						const followingInconsistency = checkInconsistent(firstReading, fourthReading);
						if (!followingInconsistency) {
							repair.blacklist.push(toLocalISO(secondReading.dateTime));
							repair.blacklist.push(toLocalISO(thirdReading.dateTime));
							firstReading = fourthReading;
							secondReading = (await reader.next()).value;
							thirdReading = (await reader.next()).value;
							fourthReading = (await reader.next()).value;
							continue;
						}
					}
				}
			}

			const adjustment = await makeAdjustment(inconsistency, config, repair);
			repair.adjustments.push(adjustment);
		}

		firstReading = secondReading;
		secondReading = thirdReading;
		thirdReading = fourthReading;
		fourthReading = (await reader.next()).value;
	}

	return repair;
}

async function makeAdjustment(
	inconsistency: ReadingInconsistency,
	config: Config,
	repair: Repair
): Promise<ReadingAdjustment> {
	const adjustment = {
		readings: [inconsistency.firstReading, inconsistency.secondReading],
		dateTime: inconsistency.secondReading.dateTime,
		gridIn: 0,
		gridOut: 0,
		pv: 0,
		wallbox: 0,
		batteryIn: 0,
		batteryOut: 0
	};

	adjustment.gridIn = await calculateAdjustment('gridIn', inconsistency, config, repair);
	adjustment.gridOut = await calculateAdjustment('gridOut', inconsistency, config, repair);
	adjustment.pv = await calculateAdjustment('pv', inconsistency, config, repair);
	adjustment.wallbox = await calculateAdjustment('wallbox', inconsistency, config, repair);
	adjustment.batteryIn = await calculateAdjustment('batteryIn', inconsistency, config, repair);
	adjustment.batteryOut = await calculateAdjustment('batteryOut', inconsistency, config, repair);

	return adjustment;
}

async function calculateAdjustment(
	readingType: ReadingType,
	inconsistency: ReadingInconsistency,
	config: Config,
	repair: Repair
): Promise<number> {
	if (inconsistency[readingType]) {
		const upToDateFirstReading = await getFirstReading(config.installationDate!, config);
		const upToDateSecondReading = correctReading(inconsistency.firstReading, repair);

		const upToDateAverageIncrease =
			((upToDateSecondReading![readingType] - upToDateFirstReading[readingType]) * 1000 * 60 * 60 * 24) /
			(upToDateSecondReading!.dateTime.getTime() - upToDateFirstReading.dateTime.getTime());

		const resettedAverageIncrease =
			(inconsistency.secondReading[readingType] * 1000 * 60 * 60 * 24) /
			(inconsistency.secondReading.dateTime.getTime() - inconsistency.firstReading.dateTime.getTime());

		const isReset = Math.abs(resettedAverageIncrease - upToDateAverageIncrease) < upToDateAverageIncrease * 2;

		if (isReset) {
			return inconsistency.firstReading[readingType];
		} else {
			return inconsistency.firstReading[readingType] - inconsistency.secondReading[readingType];
		}
	}

	return 0;
}
