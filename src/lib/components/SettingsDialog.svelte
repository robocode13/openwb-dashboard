<script lang="ts">
	import Dialog from './Dialog.svelte';
	import DateInput from './DateInput.svelte';
	import type { BuyPrice, Config } from '$lib/config';
	import { currencyFormat, dateFormat, dateTimeFormat, readingNumberFormat, decimalFormat } from '$lib/format';
	import { onMount, tick } from 'svelte';
	import { mergeRepairs, type ReadingAdjustment, type Repair } from '$lib/repair';
	import { parse } from 'devalue';
	import NumberInput from './NumberInput.svelte';

	export let config: Config;

	let dialog: Dialog;

	let host: string;
	let version: number;
	let installationDate: Date | undefined = undefined;
	let sellPrice: number | undefined;
	let buyPrices: BuyPrice[] = [];
	let selectedBuyPrice: BuyPrice | undefined = undefined;
	let buyPriceDate: Date | undefined = undefined;
	let buyPriceBase: number | undefined;
	let buyPriceUnit: number | undefined;
	let batteryCapacity: number | undefined;
	let batteryMinSoc: number | undefined;
	let blacklist: string[] = [];
	let adjustments: ReadingAdjustment[] = [];
	let isCheckingReadings = false;
	let checkReadingsMessage: string = '';

	$: selectBuyPrice(selectedBuyPrice);
	$: isBuyingPriceValid = isBuyPriceValid({
		date: buyPriceDate,
		basePricePerYear: buyPriceBase,
		unitPrice: buyPriceUnit
	});
	$: isBuyingPriceModified =
		selectedBuyPrice?.date.getTime() !== buyPriceDate?.getTime() ||
		selectedBuyPrice?.basePricePerYear !== buyPriceBase ||
		selectedBuyPrice?.unitPrice !== buyPriceUnit;
	$: isValid =
		!!host &&
		version >= 1 &&
		version <= 2 &&
		isValidDate(installationDate) &&
		isPositiveNumber(sellPrice) &&
		!isBuyingPriceModified &&
		areAllBuyPricesValid(buyPrices) &&
		(batteryCapacity === undefined || isPositiveNumber(batteryCapacity)) &&
		(batteryMinSoc === undefined || (isPositiveNumber(batteryMinSoc) && batteryMinSoc <= 100));

	function sleep(ms: number) {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}

	// onMount(async () => {
	// 	await sleep(10);
	// 	show();
	// });

	function isValidDate(date: Date | undefined) {
		return date instanceof Date && !isNaN(date.getTime());
	}

	function isPositiveNumber(number: number | undefined) {
		return typeof number === 'number' && number >= 0;
	}

	export async function show() {
		host = config.wallboxHost;
		version = config.wallboxVersion;
		installationDate = config.installationDate;
		sellPrice = config.sellPrice;
		buyPrices = config.buyPrices
			.map((buyPrice) => ({ ...buyPrice }))
			.sort((a, b) => a.date.getTime() - b.date.getTime());
		selectedBuyPrice = buyPrices.length > 0 ? buyPrices[buyPrices.length - 1] : undefined;
		batteryCapacity = config.batteryCapacity;
		batteryMinSoc = config.batteryMinSoc;
		blacklist = [...config.repair.blacklist];
		adjustments = [...config.repair.adjustments];

		await dialog.show();
		return config;
	}

	function selectBuyPrice(buyPrice?: BuyPrice) {
		buyPriceDate = buyPrice?.date;
		buyPriceBase = buyPrice?.basePricePerYear;
		buyPriceUnit = buyPrice?.unitPrice;
	}

	function areAllBuyPricesValid(buyPrices: BuyPrice[]) {
		return buyPrices.every(isBuyPriceValid);
	}

	function isBuyPriceValid(buyPrice: Partial<BuyPrice>) {
		return (
			isValidDate(buyPrice.date) && isPositiveNumber(buyPrice.basePricePerYear) && isPositiveNumber(buyPrice.unitPrice)
		);
	}

	function adoptBuyingPrice() {
		if (!isBuyingPriceValid || !isBuyingPriceModified || !selectedBuyPrice) {
			return;
		}

		selectedBuyPrice.date = buyPriceDate!;
		selectedBuyPrice.basePricePerYear = buyPriceBase!;
		selectedBuyPrice.unitPrice = buyPriceUnit!;
		buyPrices.sort((a, b) => a.date.getTime() - b.date.getTime());
		buyPrices = buyPrices;
	}

	function resetBuyingPrice() {
		if (!isBuyingPriceModified || !selectedBuyPrice) {
			return;
		}

		buyPriceDate = selectedBuyPrice.date;
		buyPriceBase = selectedBuyPrice.basePricePerYear;
		buyPriceUnit = selectedBuyPrice.unitPrice;
	}

	function newBuyingPrice() {
		const today = new Date();
		today.setHours(0, 0, 0, 0);

		buyPrices = [
			...buyPrices,
			{
				date: today,
				basePricePerYear: buyPrices[buyPrices.length - 1]?.basePricePerYear ?? 0,
				unitPrice: buyPrices[buyPrices.length - 1]?.unitPrice ?? 0
			}
		];
		selectedBuyPrice = buyPrices[buyPrices.length - 1];
	}

	function deleteBuyingPrice() {
		if (isBuyingPriceModified || !selectedBuyPrice) {
			return;
		}

		const index = buyPrices.findIndex((buyPrice) => buyPrice === selectedBuyPrice);
		buyPrices = buyPrices.filter((buyPrice) => buyPrice !== selectedBuyPrice);
		selectedBuyPrice = index < buyPrices.length ? buyPrices[index] : index - 1 >= 0 ? buyPrices[index - 1] : undefined;
	}

	function deleteAdjustment(adjustment: ReadingAdjustment) {
		adjustments = adjustments.filter((a) => a !== adjustment);
	}

	async function checkReadings() {
		isCheckingReadings = true;

		try {
			const response = await fetch('readingcheck');

			if (!response.ok) {
				throw new Error(`Server responded with status ${response.status}: ${await response.text()}`);
			}

			const repair = parse(await response.text()) as Repair;
			const newRepair = mergeRepairs(
				{
					blacklist,
					adjustments
				},
				repair
			);
			blacklist = newRepair.blacklist;
			adjustments = newRepair.adjustments;
		} catch (error) {
			checkReadingsMessage = `${error}`;
		} finally {
			isCheckingReadings = false;
		}
	}

	async function onSubmit() {
		if (!isValid) return;

		config.wallboxHost = host;
		config.wallboxVersion = version;
		config.installationDate = installationDate;
		config.sellPrice = sellPrice!;
		config.buyPrices = buyPrices;
		config.batteryCapacity = batteryCapacity;
		config.batteryMinSoc = batteryMinSoc;
		config.repair.adjustments = adjustments;
		//config.repair.blacklist = blacklist;

		const response = await fetch('config', {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(config)
		});

		if (!response.ok) {
			throw new Error(`Failed to save config (${response.status}): ${await response.text()}`);
		}
	}
</script>

<Dialog bind:this={dialog} id="settingsDialog" title="Einstellungen" {isValid} {onSubmit} size="lg">
	<div class="row mb-3">
		<div class="col-6">
			<label for="host" class="form-label">OpenWB Host or IP</label>
			<div class="input-group">
				<span class="input-group-text">
					<svg width="16" height="16" fill="currentColor" class="bi bi-hdd-network" viewBox="0 0 16 16">
						<path d="M4.5 5a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1M3 4.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0" />
						<path
							d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2H8.5v3a1.5 1.5 0 0 1 1.5 1.5h5.5a.5.5 0 0 1 0 1H10A1.5 1.5 0 0 1 8.5 14h-1A1.5 1.5 0 0 1 6 12.5H.5a.5.5 0 0 1 0-1H6A1.5 1.5 0 0 1 7.5 10V7H2a2 2 0 0 1-2-2zm1 0v1a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1H2a1 1 0 0 0-1 1m6 7.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5" />
					</svg>
				</span>
				<input type="url" id="host" bind:value={host} class="form-control" />
			</div>
		</div>
		<div class="col-6">
			<label for="version" class="form-label">OpenWB Version</label>
			<div class="mt-1">
				<div class="form-check form-check-inline">
					<input id="version1" type="radio" value={1} bind:group={version} class="form-check-input" />
					<label class="form-check-label" for="version1">1.x (CSV)</label>
				</div>
				<div class="form-check form-check-inline">
					<input id="version2" type="radio" value={2} bind:group={version} class="form-check-input" />
					<label class="form-check-label" for="version2">2.x (JSON)</label>
				</div>
			</div>
		</div>
	</div>
	<div class="row g-3">
		<div class="col-6">
			<label for="installationDate" class="form-label">Inbetriebnahme</label>
			<div class="input-group">
				<span class="input-group-text">
					<svg width="16" height="16" fill="currentColor" class="bi bi-calendar4-event" viewBox="0 0 16 16">
						<path
							d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5M2 2a1 1 0 0 0-1 1v1h14V3a1 1 0 0 0-1-1zm13 3H1v9a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1z" />
						<path d="M11 7.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5z" />
					</svg>
				</span>
				<DateInput id="installationDate" bind:date={installationDate} locale="de-DE" class="form-control" />
			</div>
		</div>
		<div class="col-6">
			<label for="sellPrice" class="form-label">Einspeisevergütung</label>
			<div class="input-group">
				<span class="input-group-text">
					<svg width="16" height="16" fill="currentColor" class="bi bi-currency-euro" viewBox="0 0 16 16">
						<path
							d="M4 9.42h1.063C5.4 12.323 7.317 14 10.34 14c.622 0 1.167-.068 1.659-.185v-1.3c-.484.119-1.045.17-1.659.17-2.1 0-3.455-1.198-3.775-3.264h4.017v-.928H6.497v-.936q-.002-.165.008-.329h4.078v-.927H6.618c.388-1.898 1.719-2.985 3.723-2.985.614 0 1.175.05 1.659.177V2.194A6.6 6.6 0 0 0 10.341 2c-2.928 0-4.82 1.569-5.244 4.3H4v.928h1.01v1.265H4v.928z" />
					</svg>
				</span>
				<NumberInput id="sellPrice" bind:number={sellPrice} locale="de-DE" class="form-control"></NumberInput>
				<span class="input-group-text">pro kWh</span>
			</div>
		</div>
		<div class="col-6">
			<label for="buyPriceList" class="form-label">Stromkosten</label>
			<select id="buyPriceList" bind:value={selectedBuyPrice} class="form-select" size="8">
				{#each buyPrices as buyPrice}
					<option value={buyPrice}>
						{dateFormat.format(buyPrice.date)}
						{decimalFormat.format(buyPrice.unitPrice * 100)} ct/kWh /
						{currencyFormat.format(buyPrice.basePricePerYear)}/Jahr
					</option>
				{/each}
			</select>
		</div>
		<div class="col-6">
			<label for="buyPriceDate" class="form-label">Ab dem</label>
			<div class="input-group">
				<span class="input-group-text">
					<svg width="16" height="16" fill="currentColor" class="bi bi-calendar4-event" viewBox="0 0 16 16">
						<path
							d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5M2 2a1 1 0 0 0-1 1v1h14V3a1 1 0 0 0-1-1zm13 3H1v9a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1z" />
						<path d="M11 7.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5z" />
					</svg>
				</span>
				<DateInput id="buyPriceDate" bind:date={buyPriceDate} locale="de-DE" class="form-control" />
			</div>
			<label for="buyPriceBase" class="form-label mt-3">Grundgebühr</label>
			<div class="input-group">
				<span class="input-group-text">
					<svg width="16" height="16" fill="currentColor" class="bi bi-currency-euro" viewBox="0 0 16 16">
						<path
							d="M4 9.42h1.063C5.4 12.323 7.317 14 10.34 14c.622 0 1.167-.068 1.659-.185v-1.3c-.484.119-1.045.17-1.659.17-2.1 0-3.455-1.198-3.775-3.264h4.017v-.928H6.497v-.936q-.002-.165.008-.329h4.078v-.927H6.618c.388-1.898 1.719-2.985 3.723-2.985.614 0 1.175.05 1.659.177V2.194A6.6 6.6 0 0 0 10.341 2c-2.928 0-4.82 1.569-5.244 4.3H4v.928h1.01v1.265H4v.928z" />
					</svg>
				</span>
				<NumberInput id="buyPriceBase" bind:number={buyPriceBase} locale="de-DE" class="form-control"></NumberInput>
				<span class="input-group-text">pro Jahr</span>
			</div>
			<label for="buyPriceUnit" class="form-label mt-3">Arbeitspreis</label>
			<div class="input-group">
				<span class="input-group-text">
					<svg width="16" height="16" fill="currentColor" class="bi bi-currency-euro" viewBox="0 0 16 16">
						<path
							d="M4 9.42h1.063C5.4 12.323 7.317 14 10.34 14c.622 0 1.167-.068 1.659-.185v-1.3c-.484.119-1.045.17-1.659.17-2.1 0-3.455-1.198-3.775-3.264h4.017v-.928H6.497v-.936q-.002-.165.008-.329h4.078v-.927H6.618c.388-1.898 1.719-2.985 3.723-2.985.614 0 1.175.05 1.659.177V2.194A6.6 6.6 0 0 0 10.341 2c-2.928 0-4.82 1.569-5.244 4.3H4v.928h1.01v1.265H4v.928z" />
					</svg>
				</span>
				<NumberInput id="buyPriceUnit" bind:number={buyPriceUnit} locale="de-DE" class="form-control"></NumberInput>
				<span class="input-group-text">pro kWh</span>
			</div>
		</div>
		<div class="col-6">
			<button type="button" on:click={newBuyingPrice} disabled={isBuyingPriceModified} class="btn btn-sm btn-success">
				Neuer Preis
			</button>
			<button
				type="button"
				on:click={deleteBuyingPrice}
				disabled={isBuyingPriceModified || !selectedBuyPrice}
				class="btn btn-sm btn-danger">
				Löschen
			</button>
		</div>
		<div class="col-6">
			<button
				type="button"
				on:click={adoptBuyingPrice}
				disabled={!isBuyingPriceValid || !isBuyingPriceModified}
				class="btn btn-sm btn-success">
				Übernehmen
			</button>
			<button
				type="button"
				on:click={resetBuyingPrice}
				disabled={!isBuyingPriceModified}
				class="btn btn-sm btn-warning">
				Zurücksetzen
			</button>
		</div>
		<div class="col-6">
			<label for="batteryCapacity" class="form-label">Akkukapazität</label>
			<div class="input-group">
				<span class="input-group-text">
					<svg width="16" height="16" fill="currentColor" class="bi bi-battery-full" viewBox="0 0 16 16">
						<path d="M2 6h10v4H2z" />
						<path
							d="M2 4a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm10 1a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zm4 3a1.5 1.5 0 0 1-1.5 1.5v-3A1.5 1.5 0 0 1 16 8" />
					</svg>
				</span>
				<NumberInput id="batteryCapacity" bind:number={batteryCapacity} locale="de-DE" class="form-control">
				</NumberInput>
				<span class="input-group-text">kWh</span>
			</div>
		</div>
		<div class="col-6">
			<label for="batteryMinSoc" class="form-label">Minimaler SOC</label>
			<div class="input-group">
				<span class="input-group-text">
					<svg width="16" height="16" fill="currentColor" class="bi bi-battery" viewBox="0 0 16 16">
						<path
							d="M0 6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2zm2-1a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1zm14 3a1.5 1.5 0 0 1-1.5 1.5v-3A1.5 1.5 0 0 1 16 8" />
					</svg>
				</span>
				<NumberInput id="batteryMinSoc" bind:number={batteryMinSoc} locale="de-DE" class="form-control"></NumberInput>
				<span class="input-group-text">%</span>
			</div>
		</div>
	</div>
	<div class="row mt-3">
		<h5>Zähler Korrekturen</h5>
		<div class="col-12">
			<table class="table table-dark table-sm">
				<thead>
					<tr class="text-end">
						<th class="text-start">Datum</th>
						<th>Netz Bezug</th>
						<th>Netz Einspeisung</th>
						<th>PV</th>
						<th>Wallbox</th>
						<th>Batterie In</th>
						<th>Batterie Out</th>
						<th></th>
					</tr>
				</thead>
				<tbody class="text-end">
					{#each adjustments as adjustment}
						<tr>
							<td class="text-start">{dateTimeFormat.format(adjustment.dateTime)}</td>
							<td class:text-muted={adjustment.gridIn === 0}>{readingNumberFormat.format(adjustment.gridIn)} kWh</td>
							<td class:text-muted={adjustment.gridOut === 0}>{readingNumberFormat.format(adjustment.gridOut)} kWh</td>
							<td class:text-muted={adjustment.pv === 0}>{readingNumberFormat.format(adjustment.pv)} kWh</td>
							<td class:text-muted={adjustment.wallbox === 0}>{readingNumberFormat.format(adjustment.wallbox)} kWh</td>
							<td class:text-muted={adjustment.batteryIn === 0}>
								{readingNumberFormat.format(adjustment.batteryIn)} kWh
							</td>
							<td class:text-muted={adjustment.batteryOut === 0}>
								{readingNumberFormat.format(adjustment.batteryOut)} kWh
							</td>
							<td>
								<button type="button" on:click={() => deleteAdjustment(adjustment)} class="btn btn-sm btn-danger pt-0">
									<svg width="16" height="16" fill="currentColor" class="bi bi-trash3" viewBox="0 0 16 16">
										<path
											d="M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5M11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H1.5a.5.5 0 0 0 0 1h.538l.853 10.66A2 2 0 0 0 4.885 16h6.23a2 2 0 0 0 1.994-1.84l.853-10.66h.538a.5.5 0 0 0 0-1zm1.958 1-.846 10.58a1 1 0 0 1-.997.92h-6.23a1 1 0 0 1-.997-.92L3.042 3.5zm-7.487 1a.5.5 0 0 1 .528.47l.5 8.5a.5.5 0 0 1-.998.06L5 5.03a.5.5 0 0 1 .47-.53Zm5.058 0a.5.5 0 0 1 .47.53l-.5 8.5a.5.5 0 1 1-.998-.06l.5-8.5a.5.5 0 0 1 .528-.47M8 4.5a.5.5 0 0 1 .5.5v8.5a.5.5 0 0 1-1 0V5a.5.5 0 0 1 .5-.5" />
									</svg>
								</button>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
		<div class="col-4">
			<button type="button" on:click={checkReadings} disabled={isCheckingReadings} class="btn btn-sm btn-success">
				Zählerstände reparieren
				{#if isCheckingReadings}
					<div class="ms-1 spinner-border spinner-border-sm" role="status">
						<span class="visually-hidden">Loading...</span>
					</div>
				{/if}
			</button>
		</div>
		<div class="col-8">
			{#if checkReadingsMessage}
				<p class="text-danger">{checkReadingsMessage}</p>
			{/if}
		</div>
	</div>
</Dialog>
