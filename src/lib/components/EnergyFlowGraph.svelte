<script lang="ts">
	import type { Battery } from '$lib/battery';
	import type { Energy } from '$lib/energy';
	import { formatPower, formatEnergy as formatEnergy, formatHours } from '$lib/format';
	import type { Power } from '$lib/power';
	import Ring from './Ring.svelte';
	import SvgDot from './SvgDot.svelte';
	import SvgRing from './SvgRing.svelte';
	import WarningIcon from './WarningIcon.svelte';

	type AnimatedDot = {
		id: string;
		pathId: string;
		radius: number;
		duration: number;
		begin: string;
		cssClass: string;
		phasingOut?: boolean;
	};

	export let energy: Energy;
	export let battery: Battery | undefined;
	export let power: Power | undefined;

	let animatedDots: AnimatedDot[] = [];

	$: updateDotAnimation(power);
	$: batteryStatus = updateBattery(power);

	async function updateDotAnimation(power?: Power) {
		const dots: AnimatedDot[] = [];

		if (power) {
			dots.push(...createDotsForPower(power.gridOut, 'pvToGrid', 'yellow'));
			dots.push(...createDotsForPower(power.directPv, 'pvToHome', 'yellow'));
			dots.push(...createDotsForPower(power.batteryIn, 'pvToBattery', 'yellow'));
			dots.push(...createDotsForPower(power.gridIn, 'gridToHome', 'gray'));
			dots.push(...createDotsForPower(power.batteryOut, 'batteryToHome', 'green'));
		}

		animatedDots = dots;
	}

	function createDotsForPower(power: number, pathId: string, cssClass: string): AnimatedDot[] {
		const syncId = pathId + 0;
		const duration = 2;
		const dots: AnimatedDot[] = [];
		const existingDots = animatedDots.filter((dot) => dot.pathId.startsWith(pathId));
		let radius = 3.5;

		let count = Math.floor(power + 1);
		if (count == 1 && power < 0.01) {
			count = 0;
		}

		if (count <= 0) {
			return dots;
		}

		if (count === 1) {
			radius = 2 + power * 1.5;
		}

		count = Math.min(count, 5);
		const distance = duration / count;

		for (let i = 0; i < count; i++) {
			const offset = (distance * i).toFixed(2);
			const begin = i > 0 ? syncId + '.begin + ' + offset + 's' : '0s';

			const dot = existingDots.find((dot) => dot.begin === begin && !dot.phasingOut);

			if (dot) {
				dot.radius = radius;
				dots.push(dot);
				continue;
			}

			const id = i > 0 ? pathId + offset : pathId + 0;

			dots.push({
				id: id,
				pathId: pathId,
				radius: radius,
				duration: duration,
				begin: begin,
				cssClass: cssClass
			});
		}

		const phasedOutDots = existingDots.filter((dot) => dots.every((d) => d.begin !== dot.begin));
		phasedOutDots.forEach((dot) => {
			const element = document.getElementById(dot.id);
			element?.addEventListener('repeatEvent', () => {
				animatedDots = animatedDots.filter((d) => d.id !== dot.id);
			});
			dot.phasingOut = true;
		});

		dots.push(...phasedOutDots);

		return dots;
	}

	function updateBattery(power?: Power) {
		if (!battery) {
			return '';
		}

		if (power) {
			battery.updateSoc(power.batterySoc);

			if (battery.isFull) {
				return 'voll';
			}

			if (battery.isEmpty) {
				return 'leer';
			}

			if (power.batteryIn > 0) {
				battery.addCurrentCharge(power.batteryIn);
				const hoursUntilFull = battery.getHoursUntilFull();
				if (hoursUntilFull !== null && hoursUntilFull < 100) {
					return `voll in ${formatHours(hoursUntilFull)}`;
				} else {
					return 'lädt';
				}
			}

			if (power.batteryOut > 0) {
				battery.addCurrentDischarge(power.batteryOut);
				const hoursUntilEmpty = battery.getHoursUntilEmpty();
				if (hoursUntilEmpty !== null && hoursUntilEmpty < 100) {
					return `leer in ${formatHours(hoursUntilEmpty)}`;
				} else {
					return 'entlädt';
				}
			}

			return 'inaktiv';
		}

		return '';
	}
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

	<svg width="440" height="512" stroke="currentColor">
		<g transform="translate(160 0)" class="yellow">
			<SvgRing subText={formatEnergy(energy.pv)} text={power ? formatPower(power.pv) : ''}>
				<path
					d="M8 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8M8 0a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 0m0 13a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 13m8-5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2a.5.5 0 0 1 .5.5M3 8a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2A.5.5 0 0 1 3 8m10.657-5.657a.5.5 0 0 1 0 .707l-1.414 1.415a.5.5 0 1 1-.707-.708l1.414-1.414a.5.5 0 0 1 .707 0m-9.193 9.193a.5.5 0 0 1 0 .707L3.05 13.657a.5.5 0 0 1-.707-.707l1.414-1.414a.5.5 0 0 1 .707 0m9.193 2.121a.5.5 0 0 1-.707 0l-1.414-1.414a.5.5 0 0 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .707M4.464 4.465a.5.5 0 0 1-.707 0L2.343 3.05a.5.5 0 1 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .708" />
			</SvgRing>
		</g>
		<g transform="translate(0 160)" class="gray">
			<SvgRing subText="{energy.gridIn > energy.gridOut ? '+' : ''}{formatEnergy(energy.gridIn - energy.gridOut)}">
				<path
					transform="scale(0.67)"
					d="M8.28,5.45L6.5,4.55L7.76,2H16.23L17.5,4.55L15.72,5.44L15,4H9L8.28,5.45M18.62,8H14.09L13.3,5H10.7L9.91,8H5.38L4.1,10.55L5.89,11.44L6.62,10H17.38L18.1,11.45L19.89,10.56L18.62,8M17.77,22H15.7L15.46,21.1L12,15.9L8.53,21.1L8.3,22H6.23L9.12,11H11.19L10.83,12.35L12,14.1L13.16,12.35L12.81,11H14.88L17.77,22M11.4,15L10.5,13.65L9.32,18.13L11.4,15M14.68,18.12L13.5,13.64L12.6,15L14.68,18.12Z">
				</path>
			</SvgRing>
		</g>
		<g transform="translate(320 160)" class="green">
			<SvgRing subText={batteryStatus} text={power ? power.batterySoc + '%' : ''}>
				<path d="M2 6h{(power?.batterySoc ?? 0) / 10}v4H2z" />
				<path
					d="M2 4a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm10 1a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zm4 3a1.5 1.5 0 0 1-1.5 1.5v-3A1.5 1.5 0 0 1 16 8" />
			</SvgRing>
		</g>
		<g transform="translate(160 320)" class="red">
			<SvgRing subText={formatEnergy(energy.home)} text={power ? formatPower(power.home) : ''}>
				<path
					d="M8.707 1.5a1 1 0 0 0-1.414 0L.646 8.146a.5.5 0 0 0 .708.708L8 2.207l6.646 6.647a.5.5 0 0 0 .708-.708L13 5.793V2.5a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v1.293z" />
				<path d="m8 3.293 6 6V13.5a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 2 13.5V9.293z" />
			</SvgRing>
		</g>
		<g transform="translate(120 410) scale(0.85)" class="dark-red">
			<SvgRing subText={formatEnergy(energy.house)} text={power ? formatPower(power.house) : ''}>
				<svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
					<path
						d="M6 0a.5.5 0 0 1 .5.5V3h3V.5a.5.5 0 0 1 1 0V3h1a.5.5 0 0 1 .5.5v3A3.5 3.5 0 0 1 8.5 10c-.002.434-.01.845-.04 1.22-.041.514-.126 1.003-.317 1.424a2.08 2.08 0 0 1-.97 1.028C6.725 13.9 6.169 14 5.5 14c-.998 0-1.61.33-1.974.718A1.92 1.92 0 0 0 3 16H2c0-.616.232-1.367.797-1.968C3.374 13.42 4.261 13 5.5 13c.581 0 .962-.088 1.218-.219.241-.123.4-.3.514-.55.121-.266.193-.621.23-1.09.027-.34.035-.718.037-1.141A3.5 3.5 0 0 1 4 6.5v-3a.5.5 0 0 1 .5-.5h1V.5A.5.5 0 0 1 6 0" />
				</svg>
			</SvgRing>
		</g>
		<g transform="translate(230 410) scale(0.85)" class="dark-red">
			<SvgRing subText={formatEnergy(energy.wallbox)} text={power ? formatPower(power.wallbox) : ''}>
				<svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
					<path
						d="M2.52 3.515A2.5 2.5 0 0 1 4.82 2h6.362c1 0 1.904.596 2.298 1.515l.792 1.848c.075.175.21.319.38.404.5.25.855.715.965 1.262l.335 1.679q.05.242.049.49v.413c0 .814-.39 1.543-1 1.997V13.5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-1.338c-1.292.048-2.745.088-4 .088s-2.708-.04-4-.088V13.5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-1.892c-.61-.454-1-1.183-1-1.997v-.413a2.5 2.5 0 0 1 .049-.49l.335-1.68c.11-.546.465-1.012.964-1.261a.8.8 0 0 0 .381-.404l.792-1.848Zm6.75.51a.186.186 0 0 0-.23.034L6.05 7.246a.188.188 0 0 0 .137.316h1.241l-.673 2.195a.19.19 0 0 0 .085.218c.075.043.17.03.23-.034l2.88-3.187a.188.188 0 0 0-.137-.316H8.572l.782-2.195a.19.19 0 0 0-.085-.218Z" />
				</svg>
			</SvgRing>
		</g>

		<g class="yellow" fill="transparent" stroke-width="2">
			<path id="pvToGrid" d="M215 117 v88 a15 15 0 0 1 -15 15 h-80" />
			<path id="pvToHome" d="M220 117v203" x1="220" />
			<path id="pvToBattery" d="M225 117 v88 a15 15 0 0 0 15 15 h80" />
		</g>
		<g class="yellow" fill="currentColor" stroke-width="0" font-size="12">
			<text x="125" y="216">{power ? formatPower(power.gridOut) : ''}</text>
			<text x="125" y="235">{formatEnergy(energy.gridOut)}</text>
			<text x="315" y="216" text-anchor="end">{power ? formatPower(power.batteryIn) : ''}</text>
			<text x="315" y="235" text-anchor="end">{formatEnergy(energy.batteryIn)}</text>
			<text x="215" y="315" text-anchor="end">
				{power ? formatPower(power.directPv) : ''}
			</text>
			<text x="225" y="315">
				{formatEnergy(energy.directPvConsumption)}
			</text>
		</g>

		<g class="gray" fill="transparent" stroke-width="2">
			<path id="gridToHome" d="M60 280 v85 a15 15 0 0 0 15 15 h85" />
		</g>
		<g class="gray" fill="currentColor" stroke-width="0" font-size="12">
			<text x="155" y="376" text-anchor="end">{power ? formatPower(power.gridIn) : ''}</text>
		</g>
		<g class="gray" fill="currentColor" stroke-width="0" font-size="12">
			<text x="155" y="395" text-anchor="end">{formatEnergy(energy.gridIn)}</text>
		</g>

		<g class="green" fill="transparent" stroke-width="2">
			<path id="batteryToHome" d="M380 280 v85 a15 15 0 0 1 -15 15 h-85" />
		</g>
		<g class="green" fill="currentColor" stroke-width="0" font-size="12">
			<text x="285" y="376">{power ? formatPower(power.batteryOut) : ''}</text>
		</g>
		<g class="green" fill="currentColor" stroke-width="0" font-size="12">
			<text x="285" y="395">{formatEnergy(energy.batteryOut)}</text>
		</g>

		{#each animatedDots as dot (dot.id)}
			<g class={dot.cssClass}>
				<SvgDot id={dot.id} pathId={dot.pathId} radius={dot.radius} duration={dot.duration} begin={dot.begin}></SvgDot>
			</g>
		{/each}
	</svg>

	<div style="width: 120px; height: 120px;" class="blue lh-sm">
		<Ring ratio={energy.selfConsumption}>
			<span class="mt-2 mb-0 text-muted">Eigenverbrauch</span>
			<span class="mt-0 mb-0 fs-4">{(energy.selfConsumption * 100).toFixed(0)}%</span>
		</Ring>
	</div>
</div>
