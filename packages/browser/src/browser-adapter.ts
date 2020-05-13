import { LearningGradAlgorithm, NeuralNetwork, TrainItem, TrainReporter, defaultTrainReporter } from '@cross-nn/core';
import { GradAlgorithmTrainBody, Message, MessageAction, MessageType } from './types';
import { WorkerPull, WorkerTask, workerTaskCreator, WorkerTaskStatus } from './worker-pull';
import { gradAlgorithmRequestCreator } from './message-creators';

export class BrowserAdapter {
	private workerPull: WorkerPull = null;

	constructor(workerUrl: string, workerPullSize: number = 1) {
		this.workerPull = new WorkerPull(workerUrl, workerPullSize);
	}

	/**
	 * Остановить все запущенные в пулле воркеры
	 */
	public terminate() {
		this.workerPull.terminate();
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
		epochs: number,
		reporter: TrainReporter = defaultTrainReporter
	): Promise<NeuralNetwork> {
		const message = gradAlgorithmRequestCreator(nn, algorithmType, trainSet, epochs);
		const task = workerTaskCreator(message);

		const statusSubscription = this.workerPull.messages
			.subscribe((t: WorkerTask<Message>) => {
				const condition = Boolean(t)
					&& t.id === task.id
					&& t.status === WorkerTaskStatus.RUNNING
					&& Boolean(t.message)
					&& t.message.type === MessageType.RESPONSE
					&& t.message.action === MessageAction.TRAIN_GRAD_ALGORITHM_STATUS;

				if (condition) {
					reporter(t.message.body);
				}
			});

		const promise = new Promise<NeuralNetwork>((resolve, reject) => {
			const subscription = this.workerPull.messages
				.subscribe(
					(receivedTask: WorkerTask<Message<GradAlgorithmTrainBody>>) => {
						try {
							const response = receivedTask.message;
							const condition = Boolean(response)
								&& receivedTask.id === task.id
								&& receivedTask.status === WorkerTaskStatus.COMPLETE
								&& response.action === MessageAction.TRAIN_GRAD_ALGORITHM
								&& response.type === MessageType.RESPONSE;

							if (condition) {
								const body = response.body;

								if (Boolean(body.serializedNetwork)) {
									resolve(NeuralNetwork.deserialize(body.serializedNetwork));
								} else {
									reject();
								}

								subscription.unsubscribe();
								statusSubscription.unsubscribe();
							}
						} catch (err) {
							console.error(err);
							reject();
							subscription.unsubscribe();
							statusSubscription.unsubscribe();
						}
					},
					() => {},
					() => {
						reject('All threads have been terminated!');
						subscription.unsubscribe();
						statusSubscription.unsubscribe();
					}
				);
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
