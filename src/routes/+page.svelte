<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import EnergyFlowGraph from '$lib/components/EnergyFlowGraph.svelte';
	import MoneyBox from '$lib/components/MoneyBox.svelte';
	import ReadingsDialog from '$lib/components/ReadingsDialog.svelte';
	import SettingsDialog from '$lib/components/SettingsDialog.svelte';
	import { dateEquals } from '$lib/dates';
	import { Energy, Interval } from '$lib/energy';
	import { isoDateFormat } from '$lib/format';
	import { onDestroy, onMount } from 'svelte';
	import type { PageData } from './$types';
	import hotkeys from 'hotkeys-js';
	import AboutDialog from '$lib/components/AboutDialog.svelte';
	import { addStatusListener, connectToWallbox, disconnectFromWallbox } from '$lib/mqtt';
	import type { Power } from '$lib/power';

	export let data: PageData;

	const today = new Date();
	today.setHours(0, 0, 0, 0);

	let date: Date | undefined = undefined;

	let interval = initInterval(data.fromDate, data.toDate);

	let settingsDialog: SettingsDialog;
	let readingDialog: ReadingsDialog;
	let aboutDialog: AboutDialog;

	let currentPower: Power | undefined = undefined;

	let isConnected: boolean = false;
	let connectionStatus: string = '';

	addStatusListener((connected, status) => {
		console.log('MQTT connection status:', connected, status);
		isConnected = connected;
		connectionStatus = status;
	});

	$: isDataAvailable =
		data.startReading && data.endReading && data.startReading.dateTime.getTime() !== data.endReading.dateTime.getTime();
	$: energy = isDataAvailable ? Energy.fromReadings(data.startReading!, data.endReading!) : undefined;
	$: changeInterval(interval);
	$: canGoToPrevPeriod =
		interval !== Interval.Lifetime &&
		interval !== Interval.Custom &&
		data.config.installationDate !== undefined &&
		data.fromDate.getTime() > data.config.installationDate.getTime();
	$: canGoToNextPeriod =
		interval !== Interval.Lifetime && interval !== Interval.Custom && data.toDate.getTime() < today.getTime();

	onMount(() => {
		connectToWallbox(data.config.wallboxHost, (power) => {
			currentPower = power;
		});

		hotkeys('left', goToPrevPeriod);
		hotkeys('right', goToNextPeriod);
		hotkeys('r', refresh);
		hotkeys('s', () => {
			showSettings();
		});
		hotkeys('z', showReadings);
		hotkeys('h', showAbout);
		hotkeys('t', () => {
			if (interval !== Interval.Day) {
				interval = Interval.Day;
			} else {
				changePeriod();
			}
		});
		hotkeys('m', () => {
			interval = Interval.Month;
		});
		hotkeys('j', () => {
			interval = Interval.Year;
		});
		hotkeys('g', () => {
			interval = Interval.Lifetime;
		});
		hotkeys('home', () => {
			let from: Date;
			let to: Date;

			switch (interval) {
				case Interval.Day:
					changePeriod(data.config.installationDate, data.config.installationDate);
					break;
				case Interval.Month:
					from = new Date(data.config.installationDate!);
					from.setDate(1);
					to = new Date(from);
					to.setMonth(to.getMonth() + 1);
					to.setDate(to.getDate() - 1);
					changePeriod(from, to);
					break;
				case Interval.Year:
					from = new Date(data.config.installationDate!);
					from.setMonth(0, 1);
					to = new Date(from);
					to.setMonth(12);
					to.setDate(to.getDate() - 1);
					changePeriod(from, to);
					break;
			}
		});
		hotkeys('end', () => {
			const today = new Date();
			today.setHours(0, 0, 0, 0);
			let from: Date;
			let to: Date;

			switch (interval) {
				case Interval.Day:
					changePeriod();
					break;
				case Interval.Month:
					from = new Date(today);
					from.setDate(1);
					to = new Date(from);
					to.setMonth(to.getMonth() + 1);
					to.setDate(to.getDate() - 1);
					changePeriod(from, to);
					break;
				case Interval.Year:
					from = new Date(today);
					from.setMonth(0, 1);
					to = new Date(from);
					to.setMonth(12);
					to.setDate(to.getDate() - 1);
					changePeriod(from, to);
					break;
			}
		});
	});

	onDestroy(async () => {
		await disconnectFromWallbox();
	});

	function initInterval(from: Date, to: Date): Interval {
		if (
			from.getFullYear() === to.getFullYear() &&
			from.getMonth() === to.getMonth() &&
			from.getDate() === to.getDate()
		) {
			return Interval.Day;
		}

		if (from.getFullYear() === to.getFullYear() && from.getMonth() === to.getMonth() && from.getDate() === 1) {
			const lastDayOfMonth = new Date(from);
			lastDayOfMonth.setMonth(lastDayOfMonth.getMonth() + 1, 0);

			if (to.getDate() === lastDayOfMonth.getDate()) {
				return Interval.Month;
			}
		}

		if (
			from.getFullYear() === to.getFullYear() &&
			from.getMonth() === 0 &&
			to.getMonth() === 11 &&
			from.getDate() === 1 &&
			to.getDate() === 31
		) {
			return Interval.Year;
		}

		if (
			data.config.installationDate &&
			from.getTime() === data.config.installationDate.getTime() &&
			to.getTime() === today.getTime()
		) {
			return Interval.Lifetime;
		}

		return Interval.Custom;
	}

	function changeInterval(interval: Interval) {
		switch (interval) {
			case Interval.Day:
				if (data.toDate.getTime() - data.fromDate.getTime() > 1000 * 60 * 60 * 24) {
					changePeriod();
				} else {
					changePeriod(data.fromDate, data.toDate);
				}
				break;
			case Interval.Month:
				const fromDate = new Date(data.fromDate);
				fromDate.setDate(1);
				const toDate = new Date(fromDate);
				toDate.setMonth(toDate.getMonth() + 1, 0);
				changePeriod(new Date(fromDate), new Date(toDate));
				break;
			case Interval.Year:
				const year = data.fromDate.getFullYear();
				changePeriod(new Date(year, 0, 1), new Date(year, 11, 31));
				break;
			case Interval.Lifetime:
				changePeriod(data.config.installationDate);
				break;
			case Interval.Custom:
				changePeriod(data.fromDate, data.toDate);
				break;
		}
	}

	function goToNextPeriod() {
		if (!canGoToNextPeriod) {
			return;
		}

		const fromDate = new Date(data.fromDate);
		const toDate = new Date(data.toDate);

		switch (interval) {
			case Interval.Day:
			case Interval.Custom:
				fromDate.setDate(fromDate.getDate() + 1);
				toDate.setDate(toDate.getDate() + 1);
				changePeriod(fromDate, toDate);
				break;
			case Interval.Month:
				fromDate.setMonth(fromDate.getMonth() + 1, 1);
				toDate.setMonth(toDate.getMonth() + 2, 0);
				changePeriod(fromDate, toDate);
				break;
			case Interval.Year:
				fromDate.setFullYear(fromDate.getFullYear() + 1, 0, 1);
				toDate.setFullYear(toDate.getFullYear() + 1, 11, 31);
				changePeriod(fromDate, toDate);
				break;
		}
	}

	function goToPrevPeriod() {
		if (!canGoToPrevPeriod) {
			return;
		}

		const fromDate = new Date(data.fromDate);
		const toDate = new Date(data.toDate);

		switch (interval) {
			case Interval.Day:
			case Interval.Custom:
				fromDate.setDate(fromDate.getDate() - 1);
				toDate.setDate(toDate.getDate() - 1);
				changePeriod(fromDate, toDate);
				break;
			case Interval.Month:
				fromDate.setMonth(fromDate.getMonth() - 1, 1);
				toDate.setMonth(toDate.getMonth(), 0);
				changePeriod(fromDate, toDate);
				break;
			case Interval.Year:
				fromDate.setFullYear(fromDate.getFullYear() - 1, 0, 1);
				toDate.setFullYear(toDate.getFullYear() - 1, 11, 31);
				changePeriod(fromDate, toDate);
				break;
		}
	}

	function changePeriod(fromDate?: Date, toDate?: Date) {
		const today = new Date();
		today.setHours(0, 0, 0, 0);

		if (dateEquals(fromDate || today, data.fromDate) && dateEquals(toDate || today, data.toDate)) {
			return;
		}

		const query: URLSearchParams = new URLSearchParams();

		if (fromDate && fromDate.getTime() !== today.getTime()) {
			query.set('from', isoDateFormat.format(fromDate));
		}

		if (toDate && toDate.getTime() !== today.getTime()) {
			query.set('to', isoDateFormat.format(toDate));
		}

		goto('?' + query.toString(), {
			keepFocus: true,
			noScroll: true
		});
	}

	function getPeriodDisplayText(fromDate: Date, toDate: Date) {
		switch (interval) {
			case Interval.Day:
				return fromDate.toLocaleDateString();
			case Interval.Month:
				return fromDate.toLocaleDateString('default', { month: 'long', year: 'numeric' });
			case Interval.Year:
				return fromDate.getFullYear().toString();
			case Interval.Lifetime:
				return 'Seit Inbetriebnahme';
			case Interval.Custom:
				return fromDate.toLocaleDateString() + ' - ' + toDate.toLocaleDateString();
		}
	}

	function refresh() {
		invalidateAll();
	}

	function showReadings() {
		readingDialog.show();
	}

	function showAbout() {
		aboutDialog.show();
	}

	async function showSettings() {
		await settingsDialog.show();
		invalidateAll();
	}
</script>

<style>
	footer {
		position: fixed;
		bottom: 2px;
		left: 5px;
	}
</style>

<SettingsDialog bind:this={settingsDialog} config={data.config}></SettingsDialog>
<AboutDialog bind:this={aboutDialog}></AboutDialog>

{#if data.startReading && data.endReading}
	<ReadingsDialog bind:this={readingDialog} startReading={data.startReading} endReading={data.endReading}>
	</ReadingsDialog>
{/if}

<div class="d-flex">
	<form class="d-flex mx-auto mb-10">
		<select bind:value={interval} class="form-select me-2 p-2">
			<option value={Interval.Day}>Tag</option>
			<option value={Interval.Month}>Monat</option>
			<option value={Interval.Year}>Jahr</option>
			<option value={Interval.Lifetime}>Gesamtlaufzeit</option>
			<option value={Interval.Custom}>Datum</option>
		</select>
		<div class="btn-group">
			<button type="button" on:click={goToPrevPeriod} disabled={!canGoToPrevPeriod} class="btn btn-sm btn-secondary">
				<svg width="16" height="22" fill="currentColor" viewBox="0 0 16 16">
					<path
						d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0m3.5 7.5a.5.5 0 0 1 0 1H5.707l2.147 2.146a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L5.707 7.5z" />
				</svg>
			</button>
			<button type="button" class="btn btn-sm btn-secondary text-nowrap">
				{getPeriodDisplayText(data.fromDate, data.toDate)}
			</button>
			<button type="button" on:click={goToNextPeriod} disabled={!canGoToNextPeriod} class="btn btn-sm btn-secondary">
				<svg width="16" height="22" fill="currentColor" viewBox="0 0 16 16">
					<path
						d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0M4.5 7.5a.5.5 0 0 0 0 1h5.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3a.5.5 0 0 0 0-.708l-3-3a.5.5 0 1 0-.708.708L10.293 7.5z" />
				</svg>
			</button>
		</div>
		<button type="button" on:click={refresh} class="ms-2 btn btn-sm btn-secondary">
			<svg xmlns="http://www.w3.org/2000/svg" width="16" height="22" fill="currentColor" viewBox="0 0 16 16">
				<path fill-rule="evenodd" d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2z" />
				<path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466" />
			</svg>
		</button>
		<button
			type="button"
			on:click={showReadings}
			disabled={!data.startReading || !data.endReading}
			class="ms-2 btn btn-sm btn-secondary">
			<svg width="16" height="22" fill="currentColor" class="bi bi-table" viewBox="0 0 16 16">
				<path
					d="M0 2a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2zm15 2h-4v3h4zm0 4h-4v3h4zm0 4h-4v3h3a1 1 0 0 0 1-1zm-5 3v-3H6v3zm-5 0v-3H1v2a1 1 0 0 0 1 1zm-4-4h4V8H1zm0-4h4V4H1zm5-3v3h4V4zm4 4H6v3h4z" />
			</svg>
		</button>
		<button type="button" on:click={showSettings} class="ms-2 btn btn-sm btn-secondary">
			<svg width="16" height="22" fill="currentColor" class="bi bi-gear-fill" viewBox="0 0 16 16">
				<path
					d="M9.405 1.05c-.413-1.4-2.397-1.4-2.81 0l-.1.34a1.464 1.464 0 0 1-2.105.872l-.31-.17c-1.283-.698-2.686.705-1.987 1.987l.169.311c.446.82.023 1.841-.872 2.105l-.34.1c-1.4.413-1.4 2.397 0 2.81l.34.1a1.464 1.464 0 0 1 .872 2.105l-.17.31c-.698 1.283.705 2.686 1.987 1.987l.311-.169a1.464 1.464 0 0 1 2.105.872l.1.34c.413 1.4 2.397 1.4 2.81 0l.1-.34a1.464 1.464 0 0 1 2.105-.872l.31.17c1.283.698 2.686-.705 1.987-1.987l-.169-.311a1.464 1.464 0 0 1 .872-2.105l.34-.1c1.4-.413 1.4-2.397 0-2.81l-.34-.1a1.464 1.464 0 0 1-.872-2.105l.17-.31c.698-1.283-.705-2.686-1.987-1.987l-.311.169a1.464 1.464 0 0 1-2.105-.872zM8 10.93a2.929 2.929 0 1 1 0-5.86 2.929 2.929 0 0 1 0 5.858z" />
			</svg>
		</button>
		<button type="button" on:click={showAbout} class="ms-2 btn btn-sm btn-secondary">
			<svg width="16" height="22" fill="currentColor" class="bi bi-question-circle-fill" viewBox="0 0 16 16">
				<path
					d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M5.496 6.033h.825c.138 0 .248-.113.266-.25.09-.656.54-1.134 1.342-1.134.686 0 1.314.343 1.314 1.168 0 .635-.374.927-.965 1.371-.673.489-1.206 1.06-1.168 1.987l.003.217a.25.25 0 0 0 .25.246h.811a.25.25 0 0 0 .25-.25v-.105c0-.718.273-.927 1.01-1.486.609-.463 1.244-.977 1.244-2.056 0-1.511-1.276-2.241-2.673-2.241-1.267 0-2.655.59-2.75 2.286a.237.237 0 0 0 .241.247m2.325 6.443c.61 0 1.029-.394 1.029-.927 0-.552-.42-.94-1.029-.94-.584 0-1.009.388-1.009.94 0 .533.425.927 1.01.927z" />
			</svg>
		</button>
	</form>
</div>

<main class="mt-2 mx-auto d-flex align-items-center justify-content-around">
	{#if data.balance && isDataAvailable}
		<MoneyBox
			color="red"
			labels={['Strom Arbeitskosten', 'Strom Grundgebühr', 'Strom Gesamtkosten']}
			values={[
				data.balance.buyingUnitCosts,
				data.balance.buyingBaseCosts,
				data.balance.buyingUnitCosts + data.balance.buyingBaseCosts
			]}>
		</MoneyBox>
	{/if}
	{#if energy}
		<div>
			<EnergyFlowGraph {energy} power={currentPower}></EnergyFlowGraph>
		</div>
	{:else}
		<h5>Für diesen Zeitraum sind keine Daten verfügbar</h5>
	{/if}
	{#if data.balance && isDataAvailable}
		<MoneyBox
			color="green"
			labels={['Einspeisevergütung', 'Einsparung', 'Ertrag']}
			values={[data.balance.sellingIncome, data.balance.savings, data.balance.sellingIncome + data.balance.savings]}>
		</MoneyBox>
	{/if}
</main>

<footer>
	{#if isConnected}
		<svg width="16" height="16" fill="lightgreen" class="bi bi-wifi" viewBox="0 0 16 16">
			<path
				d="M15.384 6.115a.485.485 0 0 0-.047-.736A12.44 12.44 0 0 0 8 3C5.259 3 2.723 3.882.663 5.379a.485.485 0 0 0-.048.736.52.52 0 0 0 .668.05A11.45 11.45 0 0 1 8 4c2.507 0 4.827.802 6.716 2.164.205.148.49.13.668-.049" />
			<path
				d="M13.229 8.271a.482.482 0 0 0-.063-.745A9.46 9.46 0 0 0 8 6c-1.905 0-3.68.56-5.166 1.526a.48.48 0 0 0-.063.745.525.525 0 0 0 .652.065A8.46 8.46 0 0 1 8 7a8.46 8.46 0 0 1 4.576 1.336c.206.132.48.108.653-.065m-2.183 2.183c.226-.226.185-.605-.1-.75A6.5 6.5 0 0 0 8 9c-1.06 0-2.062.254-2.946.704-.285.145-.326.524-.1.75l.015.015c.16.16.407.19.611.09A5.5 5.5 0 0 1 8 10c.868 0 1.69.201 2.42.56.203.1.45.07.61-.091zM9.06 12.44c.196-.196.198-.52-.04-.66A2 2 0 0 0 8 11.5a2 2 0 0 0-1.02.28c-.238.14-.236.464-.04.66l.706.706a.5.5 0 0 0 .707 0l.707-.707z" />
		</svg>
	{:else}
		<svg width="16" height="16" fill="red" class="bi bi-wifi-off" viewBox="0 0 16 16">
			<path
				d="M10.706 3.294A12.6 12.6 0 0 0 8 3C5.259 3 2.723 3.882.663 5.379a.485.485 0 0 0-.048.736.52.52 0 0 0 .668.05A11.45 11.45 0 0 1 8 4q.946 0 1.852.148zM8 6c-1.905 0-3.68.56-5.166 1.526a.48.48 0 0 0-.063.745.525.525 0 0 0 .652.065 8.45 8.45 0 0 1 3.51-1.27zm2.596 1.404.785-.785q.947.362 1.785.907a.482.482 0 0 1 .063.745.525.525 0 0 1-.652.065 8.5 8.5 0 0 0-1.98-.932zM8 10l.933-.933a6.5 6.5 0 0 1 2.013.637c.285.145.326.524.1.75l-.015.015a.53.53 0 0 1-.611.09A5.5 5.5 0 0 0 8 10m4.905-4.905.747-.747q.886.451 1.685 1.03a.485.485 0 0 1 .047.737.52.52 0 0 1-.668.05 11.5 11.5 0 0 0-1.811-1.07M9.02 11.78c.238.14.236.464.04.66l-.707.706a.5.5 0 0 1-.707 0l-.707-.707c-.195-.195-.197-.518.04-.66A2 2 0 0 1 8 11.5c.374 0 .723.102 1.021.28zm4.355-9.905a.53.53 0 0 1 .75.75l-10.75 10.75a.53.53 0 0 1-.75-.75z" />
		</svg>
	{/if}

	{connectionStatus}
</footer>
