import mqtt, { type MqttClient } from 'mqtt';
import { Power } from './power';

let client: MqttClient;

let grid = 0;
let pv = 0;
let wallbox = 0;
let battery = 0;
let batterySoc = 0;

export async function connectToWallbox(host: string, callback: (power: Power) => void) {
	client = await mqtt.connectAsync(`ws://${host}/ws`);
	console.log('Connected to MQTT broker');

	// TODO: determine counter ID dynamically

	await client.subscribeAsync([
		'openWB/counter/0/get/power',
		'openWB/pv/get/power',
		'openWB/chargepoint/get/power',
		'openWB/bat/get/power',
		'openWB/bat/get/soc'
	]);

	client.on('message', (topic, message) => {
		switch (topic) {
			case 'openWB/pv/get/power':
				pv = parseFloat(message.toString());
				break;
			case 'openWB/counter/0/get/power':
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

		console.log('Received message', topic, message.toString());
		if (callback) {
			callback(new Power(new Date(), grid / 1000, pv / 1000, wallbox / 1000, battery / 1000, batterySoc));
		}
	});
}

export async function disconnectFromWallbox() {
	if (client) {
		await client.endAsync();
		console.log('Disconnected from MQTT broker');
	}
}
