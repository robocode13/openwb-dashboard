<script lang="ts">
	import { dateEquals } from '$lib/dates';

	export let date: Date | undefined = undefined;
	export let locale: string | undefined = undefined;

	const dateFormat = new Intl.DateTimeFormat(locale, { day: '2-digit', month: '2-digit', year: 'numeric' });
	const parts = dateFormat.formatToParts(new Date('3333-11-22'));
	const legalChars = [
		'0',
		'1',
		'2',
		'3',
		'4',
		'5',
		'6',
		'7',
		'8',
		'9',
		...parts.filter((part) => part.type === 'literal').map((part) => part.value)
	];

	let text: string = '';

	$: initText(date);

	function initText(date?: Date) {
		const currentDate = parseDate(text);

		if (dateEquals(date, currentDate)) {
			return;
		}

		if (!date || isNaN(date.getTime())) {
			if (text !== '') {
				text = '';
			}
			return;
		}

		const newText = date ? dateFormat.format(date) : '';

		if (newText !== text) {
			text = newText;
		}
	}

	function parseDate(text: string): Date | undefined {
		if (!text) {
			return undefined;
		}

		let year = 0;
		let month = 0;
		let day = 0;
		let index = 0;

		for (const part of parts) {
			if (part.type === 'literal') {
				if (text.slice(index, index + part.value.length) !== part.value) {
					return new Date(NaN);
				}
				index += part.value.length;
			} else {
				const number = parseInt(text.slice(index));
				if (isNaN(number)) {
					return new Date(NaN);
				}

				index++;
				while (index < text.length && /\d/.test(text[index])) {
					index++;
				}

				switch (part.type) {
					case 'day':
						day = number;
						break;
					case 'month':
						month = number;
						break;
					case 'year':
						if (number < 100) {
							year = number + 2000;
						} else {
							year = number;
						}
						break;
				}
			}
		}

		return new Date(
			`${year.toString().padStart(4, '0')}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}T00:00`
		);
	}

	function onBeforeInput(event: Event | InputEvent) {
		const inputEvent = event as InputEvent;

		if (inputEvent.data === null) {
			return;
		}

		if (inputEvent.data.split('').some((char) => !legalChars.includes(char))) {
			event.preventDefault();
		}
	}

	function onInput(event: Event | InputEvent) {
		date = parseDate(text);
	}

	function onKeyDown(event: KeyboardEvent) {
		if (event.key === 't') {
			text = dateFormat.format(new Date());
			date = parseDate(text);
			event.preventDefault();
		} else if (event.key === 'ArrowUp') {
			if (date && !isNaN(date.getTime())) {
				const newDate = new Date(date);
				newDate.setDate(date.getDate() + 1);
				text = dateFormat.format(newDate);
				date = parseDate(text);
				event.preventDefault();
			}
		} else if (event.key === 'ArrowDown') {
			if (date && !isNaN(date.getTime())) {
				const newDate = new Date(date);
				newDate.setDate(date.getDate() - 1);
				text = dateFormat.format(newDate);
				date = parseDate(text);
				event.preventDefault();
			}
		}
	}

	function onBlur() {
		if (date && !isNaN(date.getTime())) {
			text = dateFormat.format(date);
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
