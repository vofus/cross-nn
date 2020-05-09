import { GradAlgorithmTrainMessage } from '../types';
import { NeuralNetwork } from '@cross-nn/core';
import { guid } from '../utils';

export function gradAlgorithmTrainMessageCreator(nn: NeuralNetwork, ...args: any[]): GradAlgorithmTrainMessage {
	return {
		action: 'TRAIN_GRAD_ALGORITHM',
		id: guid(),
		serializedNetwork: NeuralNetwork.serialize(nn),
		args
	};
}
