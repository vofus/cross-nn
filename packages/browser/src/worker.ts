import { NeuralNetwork, TrainMessage, TrainReporter } from '@cross-nn/core';
import { WorkerTask, WorkerTaskStatus } from './worker-pull';
import { GradAlgorithmTrainBody, Message, MessageAction, MessageType } from './types';

/**
 * Обработчик сообщений от основного потока
 */
self.onmessage = async (e: MessageEvent) => {
	const task: WorkerTask<Message> = e.data;

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
function gradAlgorithmTrain(task: WorkerTask<Message<GradAlgorithmTrainBody>>) {
	const message = task.message;
	const condition = Boolean(message)
		&& Boolean(message.body)
		&& Boolean(message.body.serializedNetwork)
		&& Array.isArray(message.body.args)
		&& message.body.args.length >= 3;

	const dummyTask: WorkerTask<Message<GradAlgorithmTrainBody>> = {
		id: task.id,
		status: WorkerTaskStatus.COMPLETE,
		message: null
	};

	const dummyMessage: Message = {
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
		nn.gradAlgorithmTrain(...message.body.args, gradAlgorithmTrainReporter(task));

		// Сериализация сети и подготовка сообщения
		const serializedNetwork = NeuralNetwork.serialize(nn);
		const response: Message<GradAlgorithmTrainBody> = {
			...dummyMessage,
			body: {
				serializedNetwork
			}
		};

		// Отправить сообщение в основной поток
		// @ts-ignore
		self.postMessage({...dummyTask, message: response});
	} catch (err) {
		// @ts-ignore
		self.postMessage({...dummyTask, message: dummyMessage});
		console.error(err);
	}
}

/**
 * Создание функции уведомления о статусе задачи
 */
function gradAlgorithmTrainReporter(sourceTask: WorkerTask): TrainReporter {
	const worker = self;

	return (message: TrainMessage) => {
		const task: WorkerTask<Message<TrainMessage>> = {
			id: sourceTask.id,
			status: WorkerTaskStatus.RUNNING,
			message: {
				type: MessageType.RESPONSE,
				action: MessageAction.TRAIN_GRAD_ALGORITHM_STATUS,
				body: message
			}
		};

		// @ts-ignore
		worker.postMessage(task);
	};
}
