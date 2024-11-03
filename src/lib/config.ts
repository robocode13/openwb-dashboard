import type { Repair } from './repair';

export type Config = {
	wallboxHost: string;
	wallboxVersion: number;
	installationDate?: Date;
	sellPrice: number;
	buyPrices: BuyPrice[];
	batteryCapacity?: number;
	batteryMinSoc?: number;
	repair: Repair;
};

export type BuyPrice = {
	date: Date;
	unitPrice: number;
	basePricePerYear: number;
};
