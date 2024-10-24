import { toLocalISO } from '$lib/format.js';
import { calculateBalance } from '$lib/server/balanceService';
import { getStartOfDayReading } from '$lib/server/readingsRepository.js';
import { redirect } from '@sveltejs/kit';

export async function load({ url, parent }) {
	const today = new Date();
	today.setHours(0, 0, 0, 0);

	const from = url.searchParams.get('from') ?? toLocalISO(today).slice(0, 10);
	const to = url.searchParams.get('to') ?? toLocalISO(today).slice(0, 10);

	const fromDate = new Date(from + 'T00:00');
	fromDate.setHours(0, 0, 0, 0);
	const toDate = new Date(to + 'T00:00');
	toDate.setHours(0, 0, 0, 0);

	if (fromDate > toDate) {
		throw new Error('Invalid date range');
	}

	let nextToDate;

	nextToDate = new Date(toDate);
	nextToDate.setDate(toDate.getDate() + 1);

	const parentData = await parent();

	if (!parentData.config.installationDate) {
		throw redirect(302, '/first-time');
	}

	const fromReading = await getStartOfDayReading(fromDate, parentData.config);
	const toReading = await getStartOfDayReading(nextToDate, parentData.config);

	let balance;

	if (fromReading && toReading) {
		balance = await calculateBalance(fromDate, nextToDate, parentData.config);
	}

	return {
		fromDate: fromDate,
		toDate: toDate,
		startReading: fromReading,
		endReading: toReading,
		balance: balance
	};
}
