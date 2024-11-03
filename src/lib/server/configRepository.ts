import { type Config } from '$lib/config';
import { mkdir, readFile, writeFile } from 'fs/promises';

const configFilePath = 'config/config.json';

const defaultConfig: Config = {
	wallboxHost: 'openwb',
	wallboxVersion: 2,
	sellPrice: 0,
	buyPrices: [],
	repair: {
		blacklist: [],
		adjustments: []
	}
};

export async function loadConfig(): Promise<Config> {
	try {
		const buffer = await readFile(configFilePath);
		const config = JSON.parse(buffer.toString(), (key, value) =>
			key.toLowerCase().includes('date') ? new Date(value) : value
		);

		console.log(
			`Read config with ${config.buyPrices.length} buying prices and ${config.repair.blacklist.length} blacklist entries and ${config.repair.adjustments.length} adjustments`
		);
		return config;
	} catch (error) {
		console.warn('Error reading config file', error);
		return defaultConfig;
	}
}

export async function saveConfig(config: Config) {
	const content = JSON.stringify(config);
	mkdir('config').catch(() => {});
	await writeFile(configFilePath, content);
}
