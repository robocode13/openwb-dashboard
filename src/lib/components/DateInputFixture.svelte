<script lang="ts">
	import DateInput from './DateInput.svelte';

	export let dateStore;
	export let locale = 'de-DE';
</script>

<DateInput bind:date={$dateStore} {locale} />
