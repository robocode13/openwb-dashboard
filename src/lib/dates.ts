export function dateEquals(firstDate?: Date, secondDate?: Date): boolean {
	if (!firstDate && !secondDate) {
		return true;
	}

	if (firstDate && secondDate && isNaN(firstDate.getTime()) && isNaN(secondDate.getTime())) {
		return true;
	}

	if (firstDate && secondDate && firstDate.getTime() === secondDate.getTime()) {
		return true;
	}

	return false;
}
