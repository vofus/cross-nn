import { LearningGradAlgorithm, NeuralNetwork, TrainItem } from '@cross-nn/core';
import { GradAlgorithmTrainBody, MessageType, TrainMessage } from './types';
import { gradAlgorithmTrainMessageCreator } from './message-creators';

export class BrowserAdapter {
	private worker: ServiceWorker = null;

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
	public async gradAlgorithmTrainAsync(nn: NeuralNetwork, algorithmType: LearningGradAlgorithm, trainSet: TrainItem[], epochs: number): Promise<NeuralNetwork> {
		const message = gradAlgorithmTrainMessageCreator(nn, algorithmType, trainSet, epochs);

		const promise = new Promise<NeuralNetwork>((resolve, reject) => {
			const handler = (e: MessageEvent) => {
				try {
					const response: TrainMessage<GradAlgorithmTrainBody> = e.data;
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

						navigator.serviceWorker.removeEventListener('message', handler);
					}
				} catch (err) {
					console.error(err);
					reject();
					navigator.serviceWorker.removeEventListener('message', handler);
				}
			};

			navigator.serviceWorker.addEventListener('message', handler);
		});

		return (Boolean(this.worker) ? Promise.resolve() : this.register())
			.then(() => {
				this.worker.postMessage(message);

				return promise;
			});
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

	/**
	 * Зарегистрировать и обновить ServiceWorker
	 */
	private register(): Promise<any> {
		return navigator.serviceWorker
			// DEV: worker.ts; PROD: worker.js;
			.register('worker.js')
			.then((event) => {
				this.worker = event.active;

				return event.update();
			});
	}
}
