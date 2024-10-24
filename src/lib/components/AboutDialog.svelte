<script lang="ts">
	import Dialog from './Dialog.svelte';
	import Key from './Key.svelte';

	let dialog: Dialog;

	export async function show() {
		return await dialog.show().catch(() => {});
	}
</script>

<Dialog bind:this={dialog} id="aboutDialog" title="Über" isValid={true} size="xl">
	<h5>
		<img width="48" src="favicon.png" alt="Logo" />

		OpenWB Dashboard
	</h5>
	<p>Ein übersichtliches Dashboard für die OpenWB Wallbox mit zusätzlichen Statistiken und Informationen</p>

	<a href="https://github.com/robocode13/openwb-dashboard" target="_blank">
		<svg width="24" height="24" fill="currentColor" class="bi bi-github" viewBox="0 0 16 16">
			<path
				d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8" />
		</svg>
	</a>

	<a href="https://hub.docker.com/repository/docker/robocode13/openwb-dashboard" target="_blank" class="ms-2">
		<svg width="24" height="24" viewBox="0 0 24 18" fill="currentColor">
			<path
				d="M23.763 6.886c-.065-.053-.673-.512-1.954-.512-.32 0-.659.03-1.01.087-.248-1.703-1.651-2.533-1.716-2.57l-.345-.2-.227.328a4.596 4.596 0 0 0-.611 1.433c-.23.972-.09 1.884.403 2.666-.596.331-1.546.418-1.744.42H.752a.753.753 0 0 0-.75.749c-.007 1.456.233 2.864.692 4.07.545 1.43 1.355 2.483 2.409 3.13 1.181.725 3.104 1.14 5.276 1.14 1.016 0 2.03-.092 2.93-.266 1.417-.273 2.705-.742 3.826-1.391a10.497 10.497 0 0 0 2.61-2.14c1.252-1.42 1.998-3.005 2.553-4.408.075.003.148.005.221.005 1.371 0 2.215-.55 2.68-1.01.505-.5.685-.998.704-1.053L24 7.076l-.237-.19Z">
			</path>
			<path
				d="M2.216 8.075h2.119a.186.186 0 0 0 .185-.186V6a.186.186 0 0 0-.185-.186H2.216A.186.186 0 0 0 2.031 6v1.89c0 .103.083.186.185.186Zm2.92 0h2.118a.185.185 0 0 0 .185-.186V6a.185.185 0 0 0-.185-.186H5.136A.185.185 0 0 0 4.95 6v1.89c0 .103.083.186.186.186Zm2.964 0h2.118a.186.186 0 0 0 .185-.186V6a.186.186 0 0 0-.185-.186H8.1A.185.185 0 0 0 7.914 6v1.89c0 .103.083.186.186.186Zm2.928 0h2.119a.185.185 0 0 0 .185-.186V6a.185.185 0 0 0-.185-.186h-2.119a.186.186 0 0 0-.185.186v1.89c0 .103.083.186.185.186Zm-5.892-2.72h2.118a.185.185 0 0 0 .185-.186V3.28a.186.186 0 0 0-.185-.186H5.136a.186.186 0 0 0-.186.186v1.89c0 .103.083.186.186.186Zm2.964 0h2.118a.186.186 0 0 0 .185-.186V3.28a.186.186 0 0 0-.185-.186H8.1a.186.186 0 0 0-.186.186v1.89c0 .103.083.186.186.186Zm2.928 0h2.119a.185.185 0 0 0 .185-.186V3.28a.186.186 0 0 0-.185-.186h-2.119a.186.186 0 0 0-.185.186v1.89c0 .103.083.186.185.186Zm0-2.72h2.119a.186.186 0 0 0 .185-.186V.56a.185.185 0 0 0-.185-.186h-2.119a.186.186 0 0 0-.185.186v1.89c0 .103.083.186.185.186Zm2.955 5.44h2.118a.185.185 0 0 0 .186-.186V6a.185.185 0 0 0-.186-.186h-2.118a.185.185 0 0 0-.185.186v1.89c0 .103.083.186.185.186Z">
			</path>
		</svg>
	</a>

	<h5 class="mt-3">Tastenkürzel</h5>
	<dl class="mt-3 row">
		<dt class="col-1 text-end">
			<Key>h</Key>
		</dt>
		<dd class="col-2">Dieser Dialog</dd>
		<dt class="col-1 text-end">
			<Key>s</Key>
		</dt>
		<dd class="col-2">Einstellungen</dd>
		<dt class="col-1 text-end">
			<Key>z</Key>
		</dt>
		<dd class="col-2">Zählerstände</dd>
		<dt class="col-1 text-end">
			<Key>r</Key>
		</dt>
		<dd class="col-2">Daten aktualisieren</dd>
		<dt class="col-1 text-end">
			<Key>t</Key>
		</dt>
		<dd class="col-2">Tagesansicht / Heute</dd>
		<dt class="col-1 text-end">
			<Key>m</Key>
		</dt>
		<dd class="col-2">Monatsansicht</dd>
		<dt class="col-1 text-end">
			<Key>j</Key>
		</dt>
		<dd class="col-2">Jahresansicht</dd>
		<dt class="col-1 text-end">
			<Key>g</Key>
		</dt>
		<dd class="col-2">Gesamtansicht</dd>
		<dt class="col-1 text-end">
			<Key>
				<svg width="16" height="16" fill="currentColor" class="bi bi-arrow-left-short" viewBox="0 0 16 16">
					<path
						fill-rule="evenodd"
						d="M12 8a.5.5 0 0 1-.5.5H5.707l2.147 2.146a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L5.707 7.5H11.5a.5.5 0 0 1 .5.5" />
				</svg>
			</Key>
		</dt>
		<dd class="col-2">Vorherige Periode</dd>
		<dt class="col-1 text-end">
			<Key>
				<svg width="16" height="16" fill="currentColor" class="bi bi-arrow-right-short" viewBox="0 0 16 16">
					<path
						fill-rule="evenodd"
						d="M4 8a.5.5 0 0 1 .5-.5h5.793L8.146 5.354a.5.5 0 1 1 .708-.708l3 3a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708-.708L10.293 8.5H4.5A.5.5 0 0 1 4 8" />
				</svg>
			</Key>
		</dt>
		<dd class="col-2">Nächste Periode</dd>
		<dt class="col-1 text-end">
			<Key fontSize="0.5rem">Pos1</Key>
		</dt>
		<dd class="col-2">Erste Periode</dd>
		<dt class="col-1 text-end">
			<Key fontSize="0.5rem">Ende</Key>
		</dt>
		<dd class="col-2">Letzte Periode</dd>
	</dl>
	<div style="font-size: 12px;" class="d-flex gap-4">
		<div>
			<a target="_blank" href="https://icons8.com/icon/oVRbdY7ikLC3/electric-vehicle">elektrisches Fahrzeug</a> Icon von
			<a target="_blank" href="https://icons8.com">Icons8</a>
		</div>
		<div>
			Keyboard Design von <a target="_blank" href="http://www.youtube.com/@OnlineTutorialsYT">OnlineTutorials</a>
		</div>
	</div>
</Dialog>
