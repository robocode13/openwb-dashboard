<script lang="ts">
	import { currencyFormat } from '$lib/format';

	export let color: 'red' | 'green' = 'green';
	export let labels: string[] = [];
	export let values: number[] = [];
</script>

<style lang="scss">
	@import '../../../node_modules/bootstrap/scss/_functions.scss';
	@import '../../../node_modules/bootstrap/scss/_variables.scss';

	.boxrow {
		transform: skew(-20deg);
	}

	.box {
		border: 4px solid transparent;
		padding: 6px 10px;
	}

	.money {
		min-width: 72px;
		text-align: right;
	}

	.red {
		color: black;
	}

	.red > :nth-child(1) {
		background-color: $red-600;
	}
	.red > :nth-child(2) {
		background-color: $red-500;
	}
	.red > :nth-child(3) {
		background-color: $red-400;
	}
	.red > :nth-child(4) {
		background-color: $red-300;
	}
	.red > :nth-child(5) {
		background-color: $red-200;
	}

	.green {
		color: black;
	}

	.green > :nth-child(1) {
		background-color: $teal-600;
	}
	.green > :nth-child(2) {
		background-color: $teal-500;
	}
	.green > :nth-child(3) {
		background-color: $teal-400;
	}
	.green > :nth-child(4) {
		background-color: $teal-300;
	}
	.green > :nth-child(5) {
		background-color: $teal-200;
	}
</style>

<table class="mx-2 text-right {color}">
	{#each labels as label, index}
		<tr class="boxrow">
			<td class="box">{label}:</td>
			<td class="box money">
				<strong>{currencyFormat.format(values[index])}</strong>
			</td>
		</tr>
	{/each}
</table>
