export class Power {
	constructor(
		public readonly dateTime: Date,
		public readonly grid: number,
		public readonly pv: number,
		public readonly wallbox: number,
		public readonly battery: number,
		public readonly batterySoc: number
	) {
		this.pv = -pv;
	}

	get gridIn(): number {
		return Math.max(this.grid, 0);
	}

	get gridOut(): number {
		return Math.max(-this.grid, 0);
	}

	get batteryIn(): number {
		return Math.max(this.battery, 0);
	}

	get batteryOut(): number {
		return Math.max(-this.battery, 0);
	}

	get directPv(): number {
		return this.pv - this.gridOut - this.batteryIn;
	}

	get home(): number {
		return this.gridIn + this.batteryOut + this.directPv;
	}

	get house(): number {
		return this.home - this.wallbox;
	}
}
