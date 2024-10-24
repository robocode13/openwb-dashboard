<script lang="ts">
	export let fontSize = '1rem';
</script>

<style>
	kbd {
		text-align: left;
		position: relative;
		display: inline-block;
		width: 40px;
		height: 40px;
		padding: 4px 7.5px;
		border-radius: 5px;
		background: linear-gradient(180deg, #282828, #202020);
		box-shadow:
			inset -4px 0 4px rgba(0, 0, 0, 0.15),
			inset 0 -4px 4px rgba(0, 0, 0, 0.25),
			0 0 0 1px rgba(0, 0, 0, 0.75),
			5px 10px 12.5px rgba(0, 0, 0, 0.4);
		overflow: hidden;
	}

	kbd::before {
		content: '';
		position: absolute;
		top: 1.5px;
		left: 2px;
		bottom: 7px;
		right: 6px;
		background: linear-gradient(90deg, #232323, #4a4a4a);
		border-radius: 5px;
		box-shadow:
			-5px -5px 5px rgba(255, 255, 255, 0.25),
			5px 2.5px 5px rgba(0, 0, 0, 0.15);
		border-left: 0.5px solid #0004;
		border-bottom: 0.5px solid #0004;
		border-top: 0.5px solid #0009;
	}

	kbd i {
		position: relative;
		color: white;
		font-style: normal;
		text-transform: uppercase;
	}
</style>

<kbd><i style="font-size: {fontSize};"><slot></slot></i></kbd>
