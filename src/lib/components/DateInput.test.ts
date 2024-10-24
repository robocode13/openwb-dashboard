import { render } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import DateInputFixture from './DateInputFixture.svelte';
import { describe, expect, it } from 'vitest';
import { get, writable } from 'svelte/store';

describe('DateInput', () => {
	it('should render a text input', () => {
		const dateStore = writable(new Date('2024-10-01T00:00'));
		const dom = render(DateInputFixture, { dateStore });
		const input = dom.getByRole('textbox') as HTMLInputElement;
		expect(input).toBeDefined();
		expect(input.value).toBe('01.10.2024');
		expect(get(dateStore)).toEqual(new Date('2024-10-01T00:00'));
	});

	it('does not accept illegal characters', async () => {
		const user = userEvent.setup();
		const dateStore = writable(new Date('2024-10-01T00:00'));
		const dom = render(DateInputFixture, { dateStore });
		const input = dom.getByRole('textbox') as HTMLInputElement;
		await user.type(input, '/');
		expect(input.value).toBe('01.10.2024');
		expect(get(dateStore)).toEqual(new Date('2024-10-01T00:00'));
	});

	it('should change according to user input', async () => {
		const user = userEvent.setup();
		const dateStore = writable(new Date('2024-10-01T00:00'));
		const dom = render(DateInputFixture, { dateStore });
		const input = dom.getByRole('textbox') as HTMLInputElement;
		await user.type(input, '[Backspace]3[Home][Delete]1[Home][Delete]2');
		expect(input.value).toBe('21.10.2023');
		expect(get(dateStore)).toEqual(new Date('2023-10-21T00:00'));
	});

	it('returns undefined when text is cleared', async () => {
		const user = userEvent.setup();
		const dateStore = writable(new Date('2024-10-01T00:00'));
		const dom = render(DateInputFixture, { dateStore });
		const input = dom.getByRole('textbox') as HTMLInputElement;
		await user.clear(input);
		expect(input.value).toBe('');
		expect(get(dateStore)).toBeUndefined();
	});

	it('returns invalid date when text is not a valid date', async () => {
		const user = userEvent.setup();
		const dateStore = writable(new Date('2024-10-01T00:00'));
		const dom = render(DateInputFixture, { dateStore });
		const input = dom.getByRole('textbox') as HTMLInputElement;
		await user.clear(input);
		await user.type(input, '32.13.2023');
		expect(get(dateStore).getTime()).toBeNaN();
	});

	it('changes text when setting date prop again', async () => {
		const dateStore = writable(new Date('2024-10-01T00:00'));
		const dom = render(DateInputFixture, { dateStore });
		const input = dom.getByRole('textbox') as HTMLInputElement;
		expect(input.value).toBe('01.10.2024');
		dateStore.set(new Date('2023-09-22T00:00'));
		await dom.rerender({ dateStore });
		expect(input.value).toBe('22.09.2023');
		expect(get(dateStore)).toEqual(new Date('2023-09-22T00:00'));
	});

	it('clears text when setting date prop to undefined', async () => {
		const dateStore = writable<Date | undefined>(new Date('2024-10-01T00:00'));
		const dom = render(DateInputFixture, { dateStore });
		const input = dom.getByRole('textbox') as HTMLInputElement;
		expect(input.value).toBe('01.10.2024');
		dateStore.set(undefined);
		await dom.rerender({ dateStore });
		expect(input.value).toBe('');
		expect(get(dateStore)).toBeUndefined();
	});

	it('changes to current date when pressing <t>', async () => {
		const dateStore = writable(new Date('2024-10-01T00:00'));
		const dom = render(DateInputFixture, { dateStore });
		const input = dom.getByRole('textbox') as HTMLInputElement;
		expect(input.value).toBe('01.10.2024');
		await userEvent.type(input, 't');
		expect(input.value).toBe(
			new Date().toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })
		);
		const today = new Date();
		today.setHours(0, 0, 0, 0);
		expect(get(dateStore)).toEqual(today);
	});

	it('changes to next day when pressing <arrow up>', async () => {
		const dateStore = writable(new Date('2024-10-01T00:00'));
		const dom = render(DateInputFixture, { dateStore });
		const input = dom.getByRole('textbox') as HTMLInputElement;
		expect(input.value).toBe('01.10.2024');
		await userEvent.type(input, '[ArrowUp]');
		expect(input.value).toBe('02.10.2024');
		expect(get(dateStore)).toEqual(new Date('2024-10-02T00:00'));
	});

	it('changes to previous day when pressing <arrow down>', async () => {
		const dateStore = writable(new Date('2024-10-01T00:00'));
		const dom = render(DateInputFixture, { dateStore });
		const input = dom.getByRole('textbox') as HTMLInputElement;
		expect(input.value).toBe('01.10.2024');
		await userEvent.type(input, '[ArrowDown]');
		expect(input.value).toBe('30.09.2024');
		expect(get(dateStore)).toEqual(new Date('2024-09-30T00:00'));
	});
});
