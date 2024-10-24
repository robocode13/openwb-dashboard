import { loadConfig } from '$lib/server/configRepository';
import { readFile } from 'fs/promises';

export async function load({ depends }) {
	const { version } = JSON.parse(await readFile('package.json', { encoding: 'utf-8' }));

	const config = await loadConfig();

	depends('config:');

	return {
		version,
		config
	};
}
