<script lang="ts">
	export let id;
	export let pathId;
	export let duration = 2;
	export let begin = '0s';
</script>

<circle r="3" fill="currentColor" opacity="0">
	<animateMotion {id} dur="{duration}s" {begin} repeatCount="indefinite">
		<mpath href="#{pathId}" />
	</animateMotion>
	<animate
		attributeName="opacity"
		dur="{duration}s"
		{begin}
		keyTimes="0; 0.05; 0.95; 1"
		values="0; 1; 1; 0"
		repeatCount="indefinite" />
</circle>
