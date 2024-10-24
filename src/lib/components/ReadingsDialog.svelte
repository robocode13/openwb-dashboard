<script lang="ts">
	import Dialog from './Dialog.svelte';
	import { dateTimeFormat, readingNumberFormat } from '$lib/format';
	import type { Reading } from '$lib/readings';

	export let startReading: Reading;
	export let endReading: Reading;

	let dialog: Dialog;

	export async function show() {
		return await dialog.show().catch(() => {});
	}
</script>

<Dialog bind:this={dialog} id="readingsDialog" title="Zählerstände" isValid={true} size="xl">
	<div>
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
				</tr>
			</thead>
			<tbody class="text-end">
				<tr>
					<td class="text-start">{dateTimeFormat.format(startReading.dateTime)}</td>
					<td>{readingNumberFormat.format(startReading.gridIn)} kWh</td>
					<td>{readingNumberFormat.format(startReading.gridOut)} kWh</td>
					<td>{readingNumberFormat.format(startReading.pv)} kWh</td>
					<td>{readingNumberFormat.format(startReading.wallbox)} kWh</td>
					<td>{readingNumberFormat.format(startReading.batteryIn)} kWh</td>
					<td>{readingNumberFormat.format(startReading.batteryOut)} kWh</td>
				</tr>
				<tr>
					<td class="text-start">{dateTimeFormat.format(endReading.dateTime)}</td>
					<td>{readingNumberFormat.format(endReading.gridIn)} kWh</td>
					<td>{readingNumberFormat.format(endReading.gridOut)} kWh</td>
					<td>{readingNumberFormat.format(endReading.pv)} kWh</td>
					<td>{readingNumberFormat.format(endReading.wallbox)} kWh</td>
					<td>{readingNumberFormat.format(endReading.batteryIn)} kWh</td>
					<td>{readingNumberFormat.format(endReading.batteryOut)} kWh</td>
				</tr>
			</tbody>
		</table>
	</div>
</Dialog>
