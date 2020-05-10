import { LearningGradAlgorithm, NeuralNetwork, TrainItem } from '@cross-nn/core';
import { GradAlgorithmTrainBody, MessageType, TrainMessage } from './types';
import { gradAlgorithmTrainMessageCreator } from './message-creators';
import { WorkerPull, WorkerTask, WorkerTaskStatus } from './worker-pull';
import { guid } from './utils';

export class BrowserAdapter {
	private workerPull: WorkerPull = null;

	constructor(workerPullSize: number = 1) {
		this.workerPull = new WorkerPull('worker.ts', workerPullSize);
	}

	/**
	 * Загрузить нейронную сеть из файла
	 */
	public async loadNeuralNetwork(input: HTMLInputElement): Promise<NeuralNetwork> {
		const jsonSrc = await this.loadFile(input);

		return NeuralNetwork.deserialize(jsonSrc);
	}

	/**
	 * Сохранить нейронную сеть в файл
	 */
	public async saveNeuralNetwork(nn: NeuralNetwork): Promise<string> {
		const jsonSrc = NeuralNetwork.serialize(nn);
		const blob = new Blob([jsonSrc], {type: 'application/json'});

		return URL.createObjectURL(blob);
	}

	/**
	 * Запустить обучение градиентными алгоритмами в ServiceWorker
	 * @TODO требуется рефакторинг
	 */
	public async gradAlgorithmTrainAsync(
		nn: NeuralNetwork,
		algorithmType: LearningGradAlgorithm,
		trainSet: TrainItem[],
		epochs: number
	): Promise<NeuralNetwork> {
		const message = gradAlgorithmTrainMessageCreator(nn, algorithmType, trainSet, epochs);
		const task: WorkerTask<TrainMessage> = {
			id: guid(),
			status: WorkerTaskStatus.WAITING,
			message
		};

		const promise = new Promise<NeuralNetwork>((resolve, reject) => {
			const subscription = this.workerPull.messages
				.subscribe((task: WorkerTask<TrainMessage<GradAlgorithmTrainBody>>) => {
					try {
						const response = task.message;
						const condition = Boolean(response)
							&& response.id === message.id
							&& response.type === MessageType.RESPONSE;

						if (condition) {
							const body = response.body;

							if (Boolean(body.serializedNetwork)) {
								resolve(NeuralNetwork.deserialize(body.serializedNetwork));
							} else {
								reject();
							}

							subscription.unsubscribe();
						}
					} catch (err) {
						console.error(err);
						reject();
						subscription.unsubscribe();
					}
				});
		});

		this.workerPull.addTaskToQueue(task);

		return promise;
	}

	/**
	 * Загрузить файл с диска
	 */
	private async loadFile(input: HTMLInputElement): Promise<string> {
		return new Promise<string>((resolve, reject) => {
			const fileReader = new FileReader();
			fileReader.onload = () => resolve(fileReader.result as string);
			fileReader.onerror = () => reject(fileReader.error);

			try {
				const file = input.files[0];
				fileReader.readAsText(file);
			} catch (err) {
				reject(err);
			} finally {
				input.files = null;
			}
		});
	}
}
