import { loadConfig } from '$lib/server/configRepository';
import { stringify } from 'devalue';
import type { RequestHandler } from './$types';
import { checkReadings } from '$lib/server/repairService';

export const GET: RequestHandler = async () => {
	const config = await loadConfig();

	if (!config.installationDate) {
		return new Response('No installation date configured', { status: 400 });
	}

	const repair = await checkReadings(config);
	return new Response(stringify(repair));
};
