import type { Repair } from './repair';

export type Config = {
	wallboxHost: string;
	wallboxVersion: number;
	installationDate: Date | undefined;
	sellPrice: number;
	buyPrices: BuyPrice[];
	repair: Repair;
};

export type BuyPrice = {
	date: Date;
	unitPrice: number;
	basePricePerYear: number;
};
