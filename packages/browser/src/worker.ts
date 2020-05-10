import { GradAlgorithmTrainBody, MessageAction, MessageType, TrainMessage } from './types';
import { NeuralNetwork } from '@cross-nn/core';

const scope = self as any as ServiceWorkerGlobalScope;

scope.addEventListener('install', (e) => {
	console.log('FROM_SW__INSTALL: ', e);
});

scope.addEventListener('activate', (e) => {
	console.log('FROM_SW__ACTIVATE: ', e);
});

/**
 * Обработчик сообщений от основного потока
 */
scope.addEventListener('message', async (e: ExtendableMessageEvent<TrainMessage>) => {
	const client = await scope.clients.get((e.source as Client).id);
	const condition = Boolean(client)
		&& Boolean(e.data)
		&& Boolean(e.data.action)
		&& e.data.type === MessageType.REQUEST;

	if (condition) {
		switch (e.data.action) {
			case MessageAction.TRAIN_GRAD_ALGORITHM: gradAlgorithmTrain(e.data, client); break;
			default: break;
		}
	}
});

/**
 * Запустить обучение нейронной сети градиентным алгоритмом
 */
function gradAlgorithmTrain(message: TrainMessage<GradAlgorithmTrainBody>, client: Client) {
	const condition = Boolean(message)
		&& Boolean(message.body)
		&& Boolean(message.body.serializedNetwork)
		&& Array.isArray(message.body.args)
		&& message.body.args.length >= 3;

	const dummyMessage: TrainMessage = {
		id: message.id,
		type: MessageType.RESPONSE,
		action: message.action,
		body: null
	};

	if (!condition) {
		return client.postMessage(dummyMessage);
	}

	try {
		const nn = NeuralNetwork.deserialize(message.body.serializedNetwork);

		// @ts-ignore
		nn.gradAlgorithmTrain(...message.body.args);

		// Сериализация сети и подготовка сообщения
		const serializedNetwork = NeuralNetwork.serialize(nn);
		const response: TrainMessage<GradAlgorithmTrainBody> = {
			...dummyMessage,
			body: {
				serializedNetwork
			}
		};

		// Отправить сообщение в основной поток
		client.postMessage(response);
	} catch (err) {
		console.error(err);
		client.postMessage(dummyMessage);
	}
}
