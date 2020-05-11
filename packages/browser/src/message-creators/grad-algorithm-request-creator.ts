import { NeuralNetwork } from '@cross-nn/core';
import { GradAlgorithmTrainBody, MessageAction, MessageType, Message } from '../types';

export function gradAlgorithmRequestCreator(nn: NeuralNetwork, ...args: any[]): Message<GradAlgorithmTrainBody> {
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
