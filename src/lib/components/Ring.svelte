<script lang="ts">
	import { arc } from 'd3-shape';

	export let ratio = 1;
	export let thickness = 5;

	$: size = 50 + thickness;

	$: fullArcPath = arc()({
		innerRadius: 50,
		outerRadius: size,
		startAngle: 0,
		endAngle: Math.PI * 2
	});

	$: arcPath = arc()({
		innerRadius: 50,
		outerRadius: size,
		startAngle: 0,
		endAngle: Math.PI * 2 * ratio
	});
</script>

<div class="position-relative w-100 h-100">
	<svg viewBox="0 0 {size * 2} {size * 2}" class="position-absolute top-0 start-0">
		<path transform="translate({size},{size})" fill="currentColor" opacity="0.6" d={fullArcPath}></path>
		<path transform="translate({size},{size})" fill="currentColor" d={arcPath}></path>
	</svg>
	<div class="w-100 h-100 d-flex flex-column align-items-center justify-content-center">
		<slot></slot>
	</div>
</div>
