<script lang="ts">
	export let text = '';
	export let subText = '';
</script>

<g font-size="16" stroke="transparent" fill="currentColor">
	<circle cx="60" cy="60" r="60" />
	<circle cx="60" cy="60" r="55" fill="#1f2937" />
	<text x="60" y="35" text-anchor="middle">{text}</text>
	<g transform="translate(44 42) scale(2)">
		<slot></slot>
	</g>
	<text style="font-size: 0.85rem" x="60" y="92" text-anchor="middle">{subText}</text>
</g>
