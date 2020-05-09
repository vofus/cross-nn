import { GradAlgorithmTrainMessage } from './types';
import { NeuralNetwork } from '@cross-nn/core';

const scope = self as any as ServiceWorkerGlobalScope;

scope.addEventListener('install', (e) => {
	console.log('FROM_SW__INSTALL: ', e);
});

scope.addEventListener('activate', (e) => {
	console.log('FROM_SW__ACTIVATE: ', e);
});

scope.addEventListener('message', async (e) => {
	const client = await scope.clients.get((e.source as Client).id);
	const condition = Boolean(client) && Boolean(e.data) && Boolean(e.data.action);

	if (condition) {
		switch (e.data.action) {
			case 'TRAIN_GRAD_ALGORITHM': gradAlgorithmTrain(e.data, client); break;
			default: break;
		}

		// client.postMessage({action: 'MESSAGE', payload: 'Hi from SW!!!'});
	}
});

function gradAlgorithmTrain(message: GradAlgorithmTrainMessage, client: Client) {
	const condition = Boolean(message) && Boolean(message.serializedNetwork);
	const response: GradAlgorithmTrainMessage = {
		action: message.action,
		id: message.id,
		serializedNetwork: '',
		args: []
	};

	if (!condition) {
		return client.postMessage(response);
	}

	try {
		const nn = NeuralNetwork.deserialize(message.serializedNetwork);

		// @ts-ignore
		nn.gradAlgorithmTrain(...message.args);
		response.serializedNetwork = NeuralNetwork.serialize(nn);
		client.postMessage(response);
	} catch (err) {
		console.error(err);
		client.postMessage(response);
	}
}
