<script lang="ts">
	export let number: number | undefined = undefined;
	export let locale: string | undefined = undefined;

	const numberFormat = new Intl.NumberFormat(locale, {
		style: 'decimal',
		useGrouping: false,
		maximumFractionDigits: 3
	});
	const parts = numberFormat.formatToParts(1234.56);
	const decimalSeparator = parts.find((part) => part.type === 'decimal')?.value || '.';
	const minusSign = parts.find((part) => part.type === 'minusSign')?.value || '-';
	const legalChars = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', decimalSeparator, minusSign];

	let text: string = '';

	$: initText(number);

	function initText(number?: number) {
		const currentNumber = parseNumber(text);

		if (number === currentNumber) {
			return;
		}

		if (!isNumber(number)) {
			if (text !== '') {
				text = '';
			}
			return;
		}

		const newText = isNumber(number) ? numberFormat.format(number!) : '';

		if (newText !== text) {
			text = newText;
		}
	}

	function parseNumber(text: string): number | undefined {
		if (!text) {
			return undefined;
		}

		return parseFloat(text.replace(decimalSeparator, '.'));
	}

	function isNumber(number: number | undefined) {
		return typeof number === 'number' && !isNaN(number);
	}

	function onBeforeInput(event: Event | InputEvent) {
		const inputEvent = event as InputEvent;

		if (inputEvent.data === null) {
			return;
		}

		if (inputEvent.data.split('').some((char) => !legalChars.includes(char))) {
			event.preventDefault();
		}

		if (inputEvent.data.includes(decimalSeparator) && text.includes(decimalSeparator)) {
			event.preventDefault();
		}

		if (inputEvent.data.includes(minusSign) && text.includes(minusSign)) {
			event.preventDefault();
		}
	}

	function onInput(event: Event | InputEvent) {
		number = parseNumber(text);
	}

	function onKeyDown(event: KeyboardEvent) {
		if (event.key === minusSign) {
			if (isNumber(number)) {
				number = -number!;
				event.preventDefault();
			}
		} else if (event.key === 'n') {
			number = 0;
			event.preventDefault();
		} else if (event.key === 'ArrowUp') {
			if (isNumber(number)) {
				number = number! + 1;
				event.preventDefault();
			}
		} else if (event.key === 'ArrowDown') {
			if (isNumber(number)) {
				number = number! - 1;
				event.preventDefault();
			}
		}
	}

	function onBlur() {
		if (isNumber(number)) {
			text = numberFormat.format(number!);
		}
	}
</script>

<input
	bind:value={text}
	type="text"
	on:beforeinput={onBeforeInput}
	on:input={onInput}
	on:keydown={onKeyDown}
	on:blur={onBlur}
	{...$$restProps} />
