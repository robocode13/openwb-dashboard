export type ReadingType = 'gridIn' | 'gridOut' | 'pv' | 'wallbox' | 'batteryIn' | 'batteryOut';

export type Reading = Record<ReadingType, number> & {
	dateTime: Date;
	batterySoc: number;
};

export type DayReadings = {
	startOfDay: Reading;
	endOfDay: Reading;
};
