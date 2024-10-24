import type { Config } from '$lib/config.js';
import { saveConfig } from '$lib/server/configRepository';
import { error } from '@sveltejs/kit';

export async function PUT({ request }) {
	const config: Config = await request.json();

	if (!config.buyPrices || !config.repair) {
		error(400, 'invalid config');
	}

	await saveConfig(config);

	return new Response(null, { status: 204 });
}
