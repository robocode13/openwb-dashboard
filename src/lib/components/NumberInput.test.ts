import { render } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import NumberInputFixture from './NumberInputFixture.svelte';
import { describe, expect, it } from 'vitest';
import { get, writable } from 'svelte/store';

describe('NumberInput', () => {
	it('should render a number input', () => {
		const numberStore = writable(123.45);
		const dom = render(NumberInputFixture, { numberStore: numberStore });
		const input = dom.getByRole('textbox') as HTMLInputElement;
		expect(input).toBeDefined();
		expect(input.value).toBe('123,45');
		expect(get(numberStore)).toEqual(123.45);
	});

	it('does not accept illegal characters', async () => {
		const user = userEvent.setup();
		const numberStore = writable(123.45);
		const dom = render(NumberInputFixture, { numberStore });
		const input = dom.getByRole('textbox') as HTMLInputElement;
		await user.type(input, '/a. ');
		expect(input.value).toBe('123,45');
		expect(get(numberStore)).toEqual(123.45);
	});

	it('should change according to user input', async () => {
		const user = userEvent.setup();
		const numberStore = writable(123.45);
		const dom = render(NumberInputFixture, { numberStore });
		const input = dom.getByRole('textbox') as HTMLInputElement;
		await user.type(input, '[Backspace]3[Home][Delete]1[Home][Delete]2');
		expect(input.value).toBe('223,43');
		expect(get(numberStore)).toEqual(223.43);
	});

	it('returns undefined when text is cleared', async () => {
		const user = userEvent.setup();
		const numberStore = writable(123.45);
		const dom = render(NumberInputFixture, { numberStore });
		const input = dom.getByRole('textbox') as HTMLInputElement;
		await user.clear(input);
		expect(input.value).toBe('');
		expect(get(numberStore)).toBeUndefined();
	});

	it('changes text when setting number prop again', async () => {
		const numberStore = writable(123.45);
		const dom = render(NumberInputFixture, { numberStore });
		const input = dom.getByRole('textbox') as HTMLInputElement;
		expect(input.value).toBe('123,45');
		numberStore.set(17.95);
		await dom.rerender({ numberStore });
		expect(input.value).toBe('17,95');
		expect(get(numberStore)).toEqual(17.95);
	});

	it('clears text when setting number prop to undefined', async () => {
		const numberStore = writable<number | undefined>(123.45);
		const dom = render(NumberInputFixture, { numberStore });
		const input = dom.getByRole('textbox') as HTMLInputElement;
		expect(input.value).toBe('123,45');
		numberStore.set(undefined);
		await dom.rerender({ numberStore });
		expect(input.value).toBe('');
		expect(get(numberStore)).toBeUndefined();
	});

	it('changes to 0 when pressing <n>', async () => {
		const numberStore = writable(123.45);
		const dom = render(NumberInputFixture, { numberStore });
		const input = dom.getByRole('textbox') as HTMLInputElement;
		expect(input.value).toBe('123,45');
		await userEvent.type(input, 'n');
		expect(input.value).toBe('0');
		expect(get(numberStore)).toEqual(0);
	});

	it('increases number when pressing <arrow up>', async () => {
		const numberStore = writable(123.45);
		const dom = render(NumberInputFixture, { numberStore });
		const input = dom.getByRole('textbox') as HTMLInputElement;
		expect(input.value).toBe('123,45');
		await userEvent.type(input, '[ArrowUp]');
		expect(input.value).toBe('124,45');
		expect(get(numberStore)).toEqual(124.45);
	});

	it('decreases number when pressing <arrow down>', async () => {
		const numberStore = writable(123.45);
		const dom = render(NumberInputFixture, { numberStore });
		const input = dom.getByRole('textbox') as HTMLInputElement;
		expect(input.value).toBe('123,45');
		await userEvent.type(input, '[ArrowDown]');
		expect(input.value).toBe('122,45');
		expect(get(numberStore)).toEqual(122.45);
	});

	it('only accepts one decimal separator', async () => {
		const numberStore = writable(123.45);
		const dom = render(NumberInputFixture, { numberStore });
		const input = dom.getByRole('textbox') as HTMLInputElement;
		await userEvent.type(input, ',3');
		expect(input.value).toBe('123,453');
		expect(get(numberStore)).toEqual(123.453);
	});

	it('only accepts one minus sign', async () => {
		const numberStore = writable(-123.45);
		const dom = render(NumberInputFixture, { numberStore });
		const input = dom.getByRole('textbox') as HTMLInputElement;
		await userEvent.type(input, '--');
		expect(input.value).toBe('-123,45');
		expect(get(numberStore)).toEqual(-123.45);
	});

	it('minus sign is always inserted at the front', async () => {
		const numberStore = writable(123.45);
		const dom = render(NumberInputFixture, { numberStore });
		const input = dom.getByRole('textbox') as HTMLInputElement;
		await userEvent.type(input, '-3');
		expect(input.value).toBe('-123,453');
		expect(get(numberStore)).toEqual(-123.453);
	});
});
