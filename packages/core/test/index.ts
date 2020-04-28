import { NeuralNetwork } from '../src/models';
import { NeuralNetworkConfig, TrainItem, LearningGradAlgorithm } from '../src/types';

const nnConfig: NeuralNetworkConfig = {
	neuronCounts: [2, 30,/* 50, 100, 50, 30,*/ 1]
};

const trainSet: TrainItem[] = [
	{inputs: [0, 1], targets: [1]},
	{inputs: [1, 0], targets: [1]},
	{inputs: [0, 0], targets: [0]},
	{inputs: [1, 1], targets: [0]}
];

const scaledTrainSet: TrainItem[] = [];
for (let i = 0; i < 50; ++i) {
	scaledTrainSet.push(...trainSet);
}

const nn = new NeuralNetwork(nnConfig);
nn.gradAlgorithmTrain(LearningGradAlgorithm.BACK_PROP, scaledTrainSet, 10);

console.log('NN: ', nn);
