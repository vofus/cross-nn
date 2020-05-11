import { NeuralNetwork } from '@cross-nn/core';
import { GradAlgorithmTrainBody, MessageAction, MessageType, TrainMessage } from '../types';

export function gradAlgorithmRequestCreator(nn: NeuralNetwork, ...args: any[]): TrainMessage<GradAlgorithmTrainBody> {
	const body: GradAlgorithmTrainBody = {
		serializedNetwork: NeuralNetwork.serialize(nn),
		args
	};

	return {
		type: MessageType.REQUEST,
		action: MessageAction.TRAIN_GRAD_ALGORITHM,
		body
	};
}
