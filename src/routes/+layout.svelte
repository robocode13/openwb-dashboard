<script>
	import '../bootswatch.scss';
	import '../app.scss';

	export let data;
</script>

<style>
	.version {
		position: absolute;
		right: 5px;
		bottom: 2px;
	}
</style>

<h3 class="mb-2 text-center">OpenWB Dashboard</h3>

<slot />

<div class="version">
	{data.version}
</div>
