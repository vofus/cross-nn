import { NeuralNetwork, LearningGradAlgorithm, TrainItem } from '@cross-nn/core';
import { gradAlgorithmTrainMessageCreator } from './message-creators';
import { GradAlgorithmTrainMessage } from './types';

export class BrowserAdapter {
	private worker: ServiceWorker = null;

	constructor() { }

	private register(): Promise<any> {
		return navigator.serviceWorker
			.register('./worker.ts')
			.then((event) => {
				console.log(event);
				this.worker = event.active;

				return event.update();
			});
	}

	message() {
		if (Boolean(this.worker)) {
			navigator.serviceWorker.addEventListener('message', (e) => {
				console.log('RESPONSE: ', e);
			});

			setTimeout(() => {
				this.worker.postMessage({action: 'MESSAGE', payload: 'Hello, world!'});
			}, 3000);
		}
	}


	public async gradAlgorithmTrainAsync(nn: NeuralNetwork, algorithmType: LearningGradAlgorithm, trainSet: TrainItem[], epochs: number): Promise<NeuralNetwork> {
		const message = gradAlgorithmTrainMessageCreator(nn, algorithmType, trainSet, epochs);

		return new Promise((resolve, reject) => {
			const handler = (e: MessageEvent) => {
				const response: GradAlgorithmTrainMessage = e.data;

				if (Boolean(response) && response.id === message.id) {
					if (Boolean(response.serializedNetwork)) {
						resolve(NeuralNetwork.deserialize(response.serializedNetwork));
					} else {
						reject();
					}

					navigator.serviceWorker.removeEventListener('message', handler);
				}
			};

			navigator.serviceWorker.addEventListener('message', handler);
		});
	}
}
