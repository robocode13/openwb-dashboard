<script lang="ts">
	import type { Energy } from '$lib/energy';
	import { formatValue } from '$lib/format';
	import type { Power } from '$lib/power';
	import Ring from './Ring.svelte';
	import SvgRing from './SvgRing.svelte';
	import WarningIcon from './WarningIcon.svelte';

	export let energy: Energy;
	export let power: Power | undefined;
</script>

<style lang="scss">
	@import '../../../node_modules/bootstrap/scss/_functions.scss';
	@import '../../../node_modules/bootstrap/scss/_variables.scss';

	.yellow {
		color: $yellow-400;
	}

	.gray {
		color: $gray-500;
	}

	.red {
		color: $red-400;
	}

	.dark-red {
		color: $red-500;
	}

	.green {
		color: $teal-400;
	}

	.blue {
		color: $blue-300;
	}
</style>

<div class="m-1 d-flex justify-content-center">
	<div class="d-flex flex-column">
		<div style="width: 120px; height: 120px;" class="blue lh-sm">
			<Ring ratio={energy.selfSufficiency}>
				<span class="mt-2 mb-0 text-muted">Autarkie</span>
				<span class="mt-0 mb-0 fs-4">{(energy.selfSufficiency * 100).toFixed(0)}%</span>
			</Ring>
		</div>
		{#if !energy.isPlausible}
			<WarningIcon />
		{/if}
	</div>

	<svg width="440" height="500" stroke="currentColor">
		<g transform="translate(160 0)" class="yellow">
			<SvgRing text="{formatValue(energy.pv)} kWh" subText={power ? formatValue(power.pv) + ' kW' : ''}>
				<path
					d="M8 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8M8 0a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 0m0 13a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 13m8-5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2a.5.5 0 0 1 .5.5M3 8a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2A.5.5 0 0 1 3 8m10.657-5.657a.5.5 0 0 1 0 .707l-1.414 1.415a.5.5 0 1 1-.707-.708l1.414-1.414a.5.5 0 0 1 .707 0m-9.193 9.193a.5.5 0 0 1 0 .707L3.05 13.657a.5.5 0 0 1-.707-.707l1.414-1.414a.5.5 0 0 1 .707 0m9.193 2.121a.5.5 0 0 1-.707 0l-1.414-1.414a.5.5 0 0 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .707M4.464 4.465a.5.5 0 0 1-.707 0L2.343 3.05a.5.5 0 1 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .708" />
			</SvgRing>
		</g>
		<g transform="translate(0 160)" class="gray">
			<SvgRing
				text="{energy.gridIn > energy.gridOut ? '+' : ''}{formatValue(energy.gridIn - energy.gridOut)} kWh"
				subText={power ? formatValue(power.grid) + ' kW' : ''}>
				<path
					transform="scale(0.67)"
					d="M8.28,5.45L6.5,4.55L7.76,2H16.23L17.5,4.55L15.72,5.44L15,4H9L8.28,5.45M18.62,8H14.09L13.3,5H10.7L9.91,8H5.38L4.1,10.55L5.89,11.44L6.62,10H17.38L18.1,11.45L19.89,10.56L18.62,8M17.77,22H15.7L15.46,21.1L12,15.9L8.53,21.1L8.3,22H6.23L9.12,11H11.19L10.83,12.35L12,14.1L13.16,12.35L12.81,11H14.88L17.77,22M11.4,15L10.5,13.65L9.32,18.13L11.4,15M14.68,18.12L13.5,13.64L12.6,15L14.68,18.12Z">
				</path>
			</SvgRing>
		</g>
		<g transform="translate(320 160)" class="green">
			<SvgRing
				text="{energy.batteryIn > energy.batteryOut ? '+' : ''}{formatValue(energy.batteryIn - energy.batteryOut)} kWh"
				subText={power ? power.batterySoc + '%' : ''}>
				<path d="M2 6h5v4H2z" />
				<path
					d="M2 4a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm10 1a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zm4 3a1.5 1.5 0 0 1-1.5 1.5v-3A1.5 1.5 0 0 1 16 8" />
			</SvgRing>
		</g>
		<g transform="translate(160 320)" class="red">
			<SvgRing text="{formatValue(energy.home)} kWh" subText={power ? formatValue(power.home) + ' kW' : ''}>
				<path
					d="M8.707 1.5a1 1 0 0 0-1.414 0L.646 8.146a.5.5 0 0 0 .708.708L8 2.207l6.646 6.647a.5.5 0 0 0 .708-.708L13 5.793V2.5a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v1.293z" />
				<path d="m8 3.293 6 6V13.5a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 2 13.5V9.293z" />
			</SvgRing>
		</g>
		<g transform="translate(120 410) scale(0.75)" class="dark-red">
			<SvgRing text="{formatValue(energy.house)} kWh" subText={power ? formatValue(power.house) + ' kW' : ''}>
				<svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
					<path
						d="M6 0a.5.5 0 0 1 .5.5V3h3V.5a.5.5 0 0 1 1 0V3h1a.5.5 0 0 1 .5.5v3A3.5 3.5 0 0 1 8.5 10c-.002.434-.01.845-.04 1.22-.041.514-.126 1.003-.317 1.424a2.08 2.08 0 0 1-.97 1.028C6.725 13.9 6.169 14 5.5 14c-.998 0-1.61.33-1.974.718A1.92 1.92 0 0 0 3 16H2c0-.616.232-1.367.797-1.968C3.374 13.42 4.261 13 5.5 13c.581 0 .962-.088 1.218-.219.241-.123.4-.3.514-.55.121-.266.193-.621.23-1.09.027-.34.035-.718.037-1.141A3.5 3.5 0 0 1 4 6.5v-3a.5.5 0 0 1 .5-.5h1V.5A.5.5 0 0 1 6 0" />
				</svg>
			</SvgRing>
		</g>
		<g transform="translate(230 410) scale(0.75)" class="dark-red">
			<SvgRing text="{formatValue(energy.wallbox)} kWh" subText={power ? formatValue(power.wallbox) + ' kW' : ''}>
				<svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
					<path
						d="M2.52 3.515A2.5 2.5 0 0 1 4.82 2h6.362c1 0 1.904.596 2.298 1.515l.792 1.848c.075.175.21.319.38.404.5.25.855.715.965 1.262l.335 1.679q.05.242.049.49v.413c0 .814-.39 1.543-1 1.997V13.5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-1.338c-1.292.048-2.745.088-4 .088s-2.708-.04-4-.088V13.5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-1.892c-.61-.454-1-1.183-1-1.997v-.413a2.5 2.5 0 0 1 .049-.49l.335-1.68c.11-.546.465-1.012.964-1.261a.8.8 0 0 0 .381-.404l.792-1.848Zm6.75.51a.186.186 0 0 0-.23.034L6.05 7.246a.188.188 0 0 0 .137.316h1.241l-.673 2.195a.19.19 0 0 0 .085.218c.075.043.17.03.23-.034l2.88-3.187a.188.188 0 0 0-.137-.316H8.572l.782-2.195a.19.19 0 0 0-.085-.218Z" />
				</svg>
			</SvgRing>
		</g>

		<g class="yellow" fill="transparent" stroke-width="2">
			<path d="M215 117 v88 a15 15 0 0 1 -15 15 h-80" />
			<line x1="220" y1="120" x2="220" y2="320" />
			<path d="M225 117 v88 a15 15 0 0 0 15 15 h80" />
		</g>
		<g class="yellow" fill="currentColor" stroke-width="0" font-size="12">
			<text x="125" y="216">{formatValue(energy.gridOut)} kWh</text>
			<text x="315" y="216" text-anchor="end">{formatValue(energy.batteryIn)} kWh</text>
			<text x="225" y="315">
				{formatValue(energy.home - energy.batteryOut - energy.gridIn)} kWh
			</text>
		</g>

		<g class="gray" fill="transparent" stroke-width="2">
			<path d="M60 280 v85 a15 15 0 0 0 15 15 h85" />
		</g>
		<g class="gray" fill="currentColor" stroke-width="0" font-size="12">
			<text x="155" y="376" text-anchor="end">{formatValue(energy.gridIn)} kWh</text>
		</g>

		<g class="green" fill="transparent" stroke-width="2">
			<path d="M380 280 v85 a15 15 0 0 1 -15 15 h-85" />
		</g>
		<g class="green" fill="currentColor" stroke-width="0" font-size="12">
			<text x="285" y="376">{formatValue(energy.batteryOut)} kWh</text>
		</g>
	</svg>

	<div style="width: 120px; height: 120px;" class="blue lh-sm">
		<Ring ratio={energy.selfConsumption}>
			<span class="mt-2 mb-0 text-muted">Eigenverbrauch</span>
			<span class="mt-0 mb-0 fs-4">{(energy.selfConsumption * 100).toFixed(0)}%</span>
		</Ring>
	</div>
</div>
