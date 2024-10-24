<script lang="ts">
	export let text = '';
</script>

<g font-size="16" stroke="transparent" fill="currentColor">
	<circle cx="60" cy="60" r="60" />
	<circle cx="60" cy="60" r="55" fill="#1f2937" />
	<g transform="translate(44 30) scale(2)">
		<slot></slot>
	</g>
	<text x="60" y="80" text-anchor="middle">{text}</text>
</g>
