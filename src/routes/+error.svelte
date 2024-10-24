<script lang="ts">
	import { page } from '$app/stores';
</script>

<div class="p-3">
	<h1>{$page.status}: {$page.error?.message}</h1>
</div>
