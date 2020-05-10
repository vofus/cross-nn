import { NeuralNetwork } from '@cross-nn/core';
import { GradAlgorithmTrainBody, MessageAction, MessageType, TrainMessage } from '../types';
import { guid } from '../utils';

export function gradAlgorithmTrainMessageCreator(nn: NeuralNetwork, ...args: any[]): TrainMessage<GradAlgorithmTrainBody> {
	const body: GradAlgorithmTrainBody = {
		serializedNetwork: NeuralNetwork.serialize(nn),
		args
	};

	return {
		id: guid(),
		type: MessageType.REQUEST,
		action: MessageAction.TRAIN_GRAD_ALGORITHM,
		body
	};
}
