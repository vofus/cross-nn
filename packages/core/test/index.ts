import { NeuralNetwork } from '../src/models';
import { NeuralNetworkConfig } from '../src/types';

const nnConfig: NeuralNetworkConfig = {
	neuronCounts: [2, 4, 2]
};

const nn = new NeuralNetwork(nnConfig);
console.log('NN: ', nn);
