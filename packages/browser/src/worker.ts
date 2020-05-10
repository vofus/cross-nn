import { NeuralNetwork } from '@cross-nn/core';
import { WorkerTask, WorkerTaskStatus } from './worker-pull';
import { GradAlgorithmTrainBody, MessageAction, MessageType, TrainMessage } from './types';

/**
 * Обработчик сообщений от основного потока
 */
self.onmessage = async (e: MessageEvent) => {
	const task: WorkerTask<TrainMessage> = e.data;

	const condition = Boolean(task)
		&& Boolean(task.message)
		&& Boolean(task.message.action)
		&& task.message.type === MessageType.REQUEST;

	if (condition) {
		switch (task.message.action) {
			case MessageAction.TRAIN_GRAD_ALGORITHM: gradAlgorithmTrain(task); break;
			default: break;
		}
	}
};

/**
 * Запустить обучение нейронной сети градиентным алгоритмом
 */
function gradAlgorithmTrain(task: WorkerTask<TrainMessage<GradAlgorithmTrainBody>>) {
	const message = task.message;
	const condition = Boolean(message)
		&& Boolean(message.body)
		&& Boolean(message.body.serializedNetwork)
		&& Array.isArray(message.body.args)
		&& message.body.args.length >= 3;

	const dummyTask: WorkerTask<TrainMessage<GradAlgorithmTrainBody>> = {
		id: task.id,
		status: WorkerTaskStatus.COMPLETE,
		message: null
	};

	const dummyMessage: TrainMessage = {
		id: message.id,
		type: MessageType.RESPONSE,
		action: message.action,
		body: null
	};

	if (!condition) {
		// @ts-ignore
		return postMessage({...dummyTask, message: dummyMessage});
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
		// @ts-ignore
		postMessage({...dummyTask, message: response});
	} catch (err) {
		// @ts-ignore
		postMessage({...dummyTask, message: dummyMessage});
		console.error(err);
	}
}
