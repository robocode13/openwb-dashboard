<script lang="ts">
	import NumberInput from './NumberInput.svelte';

	export let numberStore;
	export let locale = 'de-DE';
</script>

<NumberInput bind:number={$numberStore} {locale} />
