<script lang="ts">
	import { goto } from '$app/navigation';
	import SettingsDialog from '$lib/components/SettingsDialog.svelte';
	import type { PageData } from './$types';

	export let data: PageData;

	let settingsDialog: SettingsDialog;

	async function openSettings() {
		await settingsDialog.show();
		goto('/');
	}
</script>

<SettingsDialog bind:this={settingsDialog} config={data.config} />

<h4 class="mt-3 text-center text-muted">Vor der ersten Nutzung ist eine Konfiguration notwendig</h4>

<div class="d-flex justify-content-center">
	<button type="button" on:click={openSettings} class="btn btn-success">Konfigurieren</button>
</div>
