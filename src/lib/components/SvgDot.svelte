<script lang="ts">
	export let id;
	export let pathId;
	export let duration;
	export let begin;
</script>

<circle r="3" fill="currentColor" opacity="0">
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
