import { LearningType } from './learning-type';
import { ActivationStrategy } from '../../activators/types';

export interface NeuralNetworkConfig {
	inputSize: number;
	hiddenSize: number;
	outputSize: number;
	learningRate?: number;
	moment?: number;
	learningType?: LearningType;
	activator?: ActivationStrategy;
}
