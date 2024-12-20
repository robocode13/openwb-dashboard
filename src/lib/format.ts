export const isoDateFormat = new Intl.DateTimeFormat('en-CA', {
	year: 'numeric',
	month: '2-digit',
	day: '2-digit'
});

export const isoDateTimeFormat = new Intl.DateTimeFormat('en-CA', {
	year: 'numeric',
	month: '2-digit',
	day: '2-digit',
	hour: '2-digit',
	minute: '2-digit'
});

export const dateFormat = new Intl.DateTimeFormat('de-DE', {
	year: 'numeric',
	month: '2-digit',
	day: '2-digit'
});

export const dateTimeFormat = new Intl.DateTimeFormat('de-DE', {
	year: 'numeric',
	month: '2-digit',
	day: '2-digit',
	hour: '2-digit',
	minute: '2-digit'
});

export const decimalFormat = new Intl.NumberFormat('de-DE', {
	style: 'decimal',
	minimumFractionDigits: 1,
	maximumFractionDigits: 1
});

export const integerFormat = new Intl.NumberFormat('de-DE', {
	style: 'decimal',
	maximumFractionDigits: 0
});

export const readingNumberFormat = new Intl.NumberFormat('de-DE', {
	style: 'decimal',
	maximumFractionDigits: 3
});

export const currencyFormat = new Intl.NumberFormat('de-DE', {
	style: 'currency',
	currency: 'EUR'
});

export function formatEnergy(value: number): string {
	let valueString = Math.abs(value) >= 100 ? integerFormat.format(value) : decimalFormat.format(value);
	valueString += ' kWh';
	return valueString;
}

export function formatPower(power: number): string {
	power = Math.max(0, power);
	return Math.abs(power) >= 1 ? decimalFormat.format(power) + ' kW' : integerFormat.format(power * 1000) + ' W';
}

export function toLocalISO(date: Date): string {
	const pad = (number: number) => (number < 10 ? '0' : '') + number;

	const year = date.getFullYear();
	const month = pad(date.getMonth() + 1);
	const day = pad(date.getDate());
	const hours = pad(date.getHours());
	const minutes = pad(date.getMinutes());
	const seconds = pad(date.getSeconds());

	return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
}

export function formatHours(hours: number) {
	if (hours >= 24) {
		return integerFormat.format(hours) + ' h';
	} else if (hours >= 3) {
		return decimalFormat.format(hours) + ' h';
	} else {
		return integerFormat.format(hours * 60) + ' min';
	}
}
