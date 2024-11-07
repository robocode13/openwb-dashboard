<script lang="ts">
	export let pathId;
	export let duration = 2;
	export let begin = 0;
</script>

<circle r="3" fill="currentColor">
	<animateMotion dur="{duration}s" {begin} repeatCount="indefinite">
		<mpath href={pathId} />
	</animateMotion>
</circle>
