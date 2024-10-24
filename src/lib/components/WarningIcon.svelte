<script lang="ts">
	import { onMount } from 'svelte';

	let warningIcon: HTMLElement;

	onMount(async () => {
		const bootstrap = await import('bootstrap');
		const tooltip = new bootstrap.Tooltip(warningIcon);
	});
</script>

<style>
	:global(.custom-tooltip) {
		--bs-tooltip-bg: red;
		--bs-tooltip-color: yellow;
	}
</style>

<figure
	bind:this={warningIcon}
	class="flex-grow-1 align-content-center align-self-center yellow"
	data-bs-placement="right"
	data-bs-custom-class="custom-tooltip"
	data-bs-title="Einige Werte sind unplausibel. Eine Korrektur von Zählerständen in den Einstellungen könnte das Problem beheben">
	<svg width="64" height="64" fill="currentColor" class="bi bi-exclamation-triangle" viewBox="0 0 16 16">
		<path
			d="M7.938 2.016A.13.13 0 0 1 8.002 2a.13.13 0 0 1 .063.016.15.15 0 0 1 .054.057l6.857 11.667c.036.06.035.124.002.183a.2.2 0 0 1-.054.06.1.1 0 0 1-.066.017H1.146a.1.1 0 0 1-.066-.017.2.2 0 0 1-.054-.06.18.18 0 0 1 .002-.183L7.884 2.073a.15.15 0 0 1 .054-.057m1.044-.45a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767z" />
		<path d="M7.002 12a1 1 0 1 1 2 0 1 1 0 0 1-2 0M7.1 5.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0z" />
	</svg>
</figure>
