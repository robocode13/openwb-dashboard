import mqtt, { type MqttClient } from 'mqtt';
import { Power } from './power';

type Counter = {
	id: number;
	type: string;
	children: Counter[];
};

let counters: Counter[] = [];
let counterId: number | undefined;

let client: MqttClient;
let lastReceivedMessageDate: Date | undefined;

let listeners: ((isConnected: boolean, status: string) => void)[] = [];

let grid = 0;
let pv = 0;
let wallbox = 0;
let battery = 0;
let batterySoc = 0;

export function addStatusListener(listener: (isConnected: boolean, status: string) => void) {
	if (!listeners.includes(listener)) {
		listeners.push(listener);
	}
}

export async function connectToWallbox(host: string, callback: (power: Power) => void) {
	client = mqtt.connect(`ws://${host}/ws`, { keepalive: 10 });

	client.on('connect', () => {
		listeners.forEach((listener) => listener(client.connected, getStatus()));
	});

	client.on('reconnect', () => {
		listeners.forEach((listener) => listener(client.connected, getStatus()));
	});

	client.on('close', () => {
		listeners.forEach((listener) => listener(client.connected, getStatus()));
	});

	client.on('offline', () => {
		listeners.forEach((listener) => listener(client.connected, getStatus()));
	});

	client.on('error', () => {
		listeners.forEach((listener) => listener(client.connected, getStatus()));
	});

	client.on('message', (topic: string, message: Buffer) => {
		lastReceivedMessageDate = new Date();
		switch (topic) {
			case 'openWB/counter/get/hierarchy':
				counters = JSON.parse(message.toString());
				counterId = getCounterId(counters);
				client.subscribe(`openWB/counter/${counterId}/get/power`);
				break;
			case 'openWB/pv/get/power':
				pv = parseFloat(message.toString());
				break;
			case `openWB/counter/${counterId}/get/power`:
				grid = parseFloat(message.toString());
				break;
			case 'openWB/bat/get/power':
				battery = parseFloat(message.toString());
				break;
			case 'openWB/bat/get/soc':
				batterySoc = parseInt(message.toString());
				break;
			case 'openWB/chargepoint/get/power':
				wallbox = parseFloat(message.toString());
				break;
		}

		if (callback) {
			callback(new Power(new Date(), grid / 1000, pv / 1000, wallbox / 1000, battery / 1000, batterySoc));
		}
	});

	await client.subscribeAsync([
		'openWB/counter/get/hierarchy',
		'openWB/pv/get/power',
		'openWB/chargepoint/get/power',
		'openWB/bat/get/power',
		'openWB/bat/get/soc'
	]);
}

export async function disconnectFromWallbox() {
	if (client) {
		await client.endAsync();
		client.removeAllListeners();
	}
}

function getCounterId(counters: Counter[]): number | undefined {
	return counters.find((counter) => counter.type === 'counter')?.id;
}

function getStatus(): string {
	if (!client) {
		return 'keine Verbindung';
	}

	if (client.connected) {
		return 'verbunden';
	} else if (client.reconnecting) {
		let status = 'Verbindung wird wiederhergestellt';
		if (lastReceivedMessageDate) {
			const seconds = Math.round((new Date().getTime() - lastReceivedMessageDate.getTime()) / 1000);
			status += `, letzte Nachricht vor ${seconds} Sekunden`;
		}
		return status;
	} else {
		return 'keine Verbindung';
	}
}
