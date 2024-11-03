export class Battery {
	static readonly ChargeHistorySize = 10;

	private soc: number | null = null;
	private chargeHistory: number[] = [];

	constructor(
		private capacity: number,
		private minSoc: number
	) {}

	updateSoc(soc: number) {
		this.soc = soc;
	}

	addCurrentCharge(chargePower: number) {
		this.chargeHistory.push(chargePower);
		if (this.chargeHistory.length > Battery.ChargeHistorySize) {
			this.chargeHistory.shift();
		}
	}

	addCurrentDischarge(dischargePower: number) {
		this.chargeHistory.push(-dischargePower);
		if (this.chargeHistory.length > Battery.ChargeHistorySize) {
			this.chargeHistory.shift();
		}
	}

	getUsableCapacity(): number {
		return (this.capacity * (100 - this.minSoc)) / 100;
	}

	getAverageCharge(): number {
		return this.chargeHistory.reduce((sum, val) => sum + val, 0) / this.chargeHistory.length;
	}

	getAvailableEnergy(): number | null {
		if (this.soc === null) {
			return null;
		}

		return (this.capacity * (this.soc - this.minSoc)) / 100;
	}

	getHoursUntilEmpty(): number | null {
		const averageCharge = this.getAverageCharge();

		if (averageCharge >= 0) {
			return null;
		}

		const availableEnergy = this.getAvailableEnergy();

		if (availableEnergy == null) {
			return null;
		}

		return availableEnergy / -averageCharge;
	}

	getHoursUntilFull(): number | null {
		const averageCharge = this.getAverageCharge();

		if (averageCharge <= 0) {
			return null;
		}

		const availableEnergy = this.getAvailableEnergy();

		if (availableEnergy == null) {
			return null;
		}

		const unusedCapacity = this.getUsableCapacity() - availableEnergy;

		return unusedCapacity / averageCharge;
	}

	get isFull(): boolean {
		return this.soc ? Math.round(this.soc) === 100 : false;
	}

	get isEmpty(): boolean {
		return this.soc ? Math.round(this.soc) <= this.minSoc : false;
	}
}
