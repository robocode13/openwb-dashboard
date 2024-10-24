import type { Balance } from '$lib/balance';
import type { Config } from '$lib/config';
import { Energy } from '$lib/energy';
import { getStartOfDayReading } from './readingsRepository';

export async function calculateBalance(from: Date, to: Date, config: Config): Promise<Balance> {
	from = new Date(from);
	to = new Date(to);
	const fromReading = await getStartOfDayReading(from, config);
	const endDate = new Date(to);
	const toReading = await getStartOfDayReading(endDate, config);

	const readings = [fromReading, toReading];

	const priceChanges = config.buyPrices.filter((p) => p.date > from && p.date <= to);

	const intermediateReadings = await Promise.all(
		priceChanges.map(async (priceChange) => {
			return await getStartOfDayReading(priceChange.date, config);
		})
	);

	readings.splice(1, 0, ...intermediateReadings);

	if (readings.some((reading) => !reading)) {
		throw new Error('Could not find all readings for the requested period');
	}

	let sellingIncome = 0;
	let savings = 0;
	let buyingUnitCosts = 0;
	let buyingBaseCosts = 0;

	for (let index = 1; index < readings.length; index++) {
		const fromReading = readings[index - 1];
		const toReading = readings[index];
		const energy = Energy.fromReadings(fromReading!, toReading!);
		let buyPrice = config.buyPrices.findLast((p) => p.date <= fromReading!.dateTime);

		if (!buyPrice) {
			buyPrice = { unitPrice: 0, basePricePerYear: 0, date: new Date(0) };
		}

		sellingIncome += energy.gridOut * config.sellPrice;
		savings += (energy.directPvConsumption + energy.batteryOut) * buyPrice.unitPrice;
		buyingUnitCosts += energy.gridIn * buyPrice.unitPrice;
		buyingBaseCosts +=
			buyPrice.basePricePerYear * ((toReading!.dateTime.getTime() - fromReading!.dateTime.getTime()) / 86400000 / 365);
	}

	return {
		sellingIncome: parseFloat(sellingIncome.toFixed(2)),
		savings: parseFloat(savings.toFixed(2)),
		buyingBaseCosts: buyingBaseCosts,
		buyingUnitCosts: parseFloat(buyingUnitCosts.toFixed(2))
	};
}
