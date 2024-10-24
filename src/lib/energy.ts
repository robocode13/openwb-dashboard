import type { Reading } from './readings';

export enum Interval {
	Day = 'day',
	Month = 'month',
	Year = 'year',
	Lifetime = 'lifetime',
	Custom = 'custom'
}

export class Energy {
	constructor(
		public readonly from: Date,
		public readonly to: Date,
		public readonly gridIn: number,
		public readonly gridOut: number,
		public readonly pv: number,
		public readonly wallbox: number,
		public readonly batteryIn: number,
		public readonly batteryOut: number,
		public readonly batterySoc: number
	) {}

	static fromReadings(fromReading: Reading, toReading: Reading): Energy {
		return new Energy(
			fromReading.dateTime,
			toReading.dateTime,
			toReading.gridIn - fromReading.gridIn,
			toReading.gridOut - fromReading.gridOut,
			toReading.pv - fromReading.pv,
			toReading.wallbox - fromReading.wallbox,
			toReading.batteryIn - fromReading.batteryIn,
			toReading.batteryOut - fromReading.batteryOut,
			toReading.batterySoc - fromReading.batterySoc
		);
	}

	get directPvConsumption(): number {
		return this.pv - this.gridOut - this.batteryIn;
	}

	get home(): number {
		return this.gridIn + this.batteryOut + this.directPvConsumption;
	}

	get house(): number {
		return this.home - this.wallbox;
	}

	get selfSufficiency(): number {
		return (this.directPvConsumption + this.batteryOut) / this.home;
	}

	get selfConsumption(): number {
		return 1.0 - this.gridOut / this.pv;
	}

	get isPlausible(): boolean {
		return (
			this.gridIn >= 0 &&
			this.gridOut >= 0 &&
			this.pv >= 0 &&
			this.wallbox >= 0 &&
			this.batteryIn >= 0 &&
			this.batteryOut >= 0 &&
			this.house >= 0 &&
			this.selfSufficiency >= 0 &&
			this.selfSufficiency <= 1 &&
			this.selfConsumption >= 0 &&
			this.selfConsumption <= 1
		);
	}
}
