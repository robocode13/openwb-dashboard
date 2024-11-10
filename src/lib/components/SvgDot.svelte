<script lang="ts">
	export let id;
	export let pathId;
	export let radius = 3;
	export let duration;
	export let begin;
</script>

<circle r={radius} fill="currentColor" opacity="0">
	<animateMotion {id} dur="{duration}s" {begin} repeatCount="indefinite">
		<mpath href="#{pathId}" />
	</animateMotion>
	<animate
		attributeName="opacity"
		dur="{duration}s"
		{begin}
		keyTimes="0; 0.02; 0.98; 1"
		values="0; 1; 1; 0"
		repeatCount="indefinite" />
</circle>
